"use client"

import React from "react"
import { createRoot } from "react-dom/client"
import { ReportPrintView, type ReportForPrint } from "./ReportPrintView"
import { apiRequest } from "@/lib/api/client"

const REPORT_DOWNLOAD_ENDPOINT = "/reports"
const REPORT_GET_ENDPOINT = "/reports"

/**
 * Generates PDF in the browser from report data and triggers download.
 * Renders into an iframe so the document has no oklch/lab CSS from the host page (html2canvas fails on those).
 */
export async function generateReportPdfInBrowser(report: ReportForPrint): Promise<void> {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new Error("PDF can only be generated in the browser")
  }

  const iframe = document.createElement("iframe")
  iframe.setAttribute("data-report-pdf-iframe", "true")
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:210mm;min-height:297mm;border:0;z-index:-1"
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    throw new Error("Could not get iframe document")
  }

  iframeDoc.open()
  iframeDoc.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body style=\"margin:0;background:#fff;color:#111827;\"></body></html>")
  iframeDoc.close()

  const body = iframeDoc.body
  const root = createRoot(body)
  root.render(
    React.createElement(ReportPrintView, { report: report as ReportForPrint })
  )

  await new Promise((r) => setTimeout(r, 800))

  const html2pdf = (await import("html2pdf.js")).default
  const filename = `report-${report?.id ?? "download"}.pdf`
  await html2pdf()
    .set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(body)
    .save()

  root.unmount()
  if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
}

export interface DownloadReportPdfOptions {
  /** If provided, used for client PDF fallback without refetch (e.g. when opening from view dialog). */
  existingReport?: ReportForPrint | null
  /** Called with error message when download fails or PDF not ready and client fallback fails. */
  onError?: (message: string) => void
}

/**
 * Tries backend download first (cached PDF). On 503 or missing URL, fetches report and generates PDF in the browser.
 */
export async function downloadReportPdf(
  reportId: string,
  options: DownloadReportPdfOptions = {}
): Promise<void> {
  const { existingReport, onError } = options

  const setErr = (msg: string) => {
    if (onError) onError(msg)
  }

  try {
    const response = await apiRequest(`${REPORT_GET_ENDPOINT}/${reportId}/download`)
    const json = await response.json().catch(() => ({}))

    if (response.ok && json?.data?.downloadUrl) {
      const a = document.createElement("a")
      a.href = json.data.downloadUrl
      a.target = "_blank"
      a.rel = "noopener noreferrer"
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    }

    if (response.status === 401 || (json?.error?.message && /auth|token|login/i.test(json.error.message))) {
      setErr("Session expired. Please log in again.")
      return
    }
  } catch (_) {
    // Network or other error; fall through to client PDF
  }

  let report: ReportForPrint | null = existingReport ?? null
  if (!report) {
    try {
      const res = await apiRequest(`${REPORT_GET_ENDPOINT}/${reportId}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) {
        setErr(data?.error?.message || data?.message || "Could not load report")
        return
      }
      report = data?.data?.report ?? data?.report ?? data
    } catch (e: any) {
      setErr(e?.message ?? "Could not load report for PDF")
      return
    }
  }

  if (!report?.data) {
    setErr("Report has no data to generate PDF")
    return
  }

  try {
    await generateReportPdfInBrowser(report as ReportForPrint)
  } catch (e: any) {
    setErr(e?.message ?? "Failed to generate PDF in browser")
  }
}
