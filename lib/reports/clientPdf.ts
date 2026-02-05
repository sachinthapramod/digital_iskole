"use client"

import React from "react"
import { createRoot } from "react-dom/client"
import { ReportPrintView, type ReportForPrint } from "./ReportPrintView"
import { apiRequest } from "@/lib/api/client"

const REPORT_DOWNLOAD_ENDPOINT = "/reports"
const REPORT_GET_ENDPOINT = "/reports"

/**
 * Generates PDF in the browser from report data and triggers download.
 * Renders ReportPrintView into a hidden div, then uses html2pdf.js to capture and save.
 */
export async function generateReportPdfInBrowser(report: ReportForPrint): Promise<void> {
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new Error("PDF can only be generated in the browser")
  }

  const container = document.createElement("div")
  container.setAttribute("data-report-pdf-root", "true")
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;width:210mm;min-height:297mm;background:#ffffff;color:#111827;z-index:-1"
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    React.createElement(ReportPrintView, { report: report as ReportForPrint })
  )

  await new Promise((r) => setTimeout(r, 600))

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
    .from(container)
    .save()

  root.unmount()
  if (container.parentNode) container.parentNode.removeChild(container)
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
