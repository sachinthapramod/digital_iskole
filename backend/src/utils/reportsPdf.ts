import puppeteer from 'puppeteer';

function escapeHtml(value: any): string {
  const s = String(value ?? '');
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function safeFilename(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export function buildStudentReportHtml(reportData: any): { html: string; filename: string } {
  const studentName = reportData?.student?.name || 'Student';
  const className = reportData?.student?.className || '';
  const admission = reportData?.student?.admissionNumber || '';
  const term = reportData?.term || '';
  const reportType = reportData?.reportType || 'Student Report';
  const generatedAt = reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : new Date().toLocaleString();

  const attendance = reportData?.attendance || {};
  const marks = reportData?.marks || {};
  const subjects: any[] = Array.isArray(marks.subjects) ? marks.subjects : [];
  const isAnnual = reportData?.isAnnual === true && subjects.some((s: any) => s.isAnnual);

  const title = `${studentName} - ${reportType}${term ? ` (${term})` : ''}`;
  const filename = safeFilename(`${title}.pdf`) || `report.pdf`;

  const rows = isAnnual
    ? subjects.map((s) => {
        const subjectName = escapeHtml(s.subjectName || '');
        const t1 = s.term1Percent != null ? `${s.term1Percent}%` : '-';
        const t2 = s.term2Percent != null ? `${s.term2Percent}%` : '-';
        const t3 = s.term3Percent != null ? `${s.term3Percent}%` : '-';
        const annualPct = typeof s.percentage === 'number' ? `${s.percentage}%` : '-';
        const gradeValue = escapeHtml(s.grade ?? '');
        return `<tr>
          <td>${subjectName}</td>
          <td style="text-align:right;">${escapeHtml(t1)}</td>
          <td style="text-align:right;">${escapeHtml(t2)}</td>
          <td style="text-align:right;">${escapeHtml(t3)}</td>
          <td style="text-align:right;">${escapeHtml(annualPct)}</td>
          <td style="text-align:center;">${gradeValue}</td>
        </tr>`;
      }).join('')
    : subjects
        .map((s) => {
          const subjectName = escapeHtml(s.subjectName || '');
          const examName = escapeHtml(s.examName || '');
          const marksValue = escapeHtml(s.marks ?? '');
          const totalValue = escapeHtml(s.totalMarks ?? '');
          const percentValue = escapeHtml(typeof s.percentage === 'number' ? `${s.percentage}%` : s.percentage ?? '');
          const gradeValue = escapeHtml(s.grade ?? '');
          return `<tr>
        <td>${subjectName}</td>
        <td>${examName}</td>
        <td style="text-align:right;">${marksValue}</td>
        <td style="text-align:right;">${totalValue}</td>
        <td style="text-align:right;">${percentValue}</td>
        <td style="text-align:center;">${gradeValue}</td>
      </tr>`;
        })
        .join('');

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 24px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px; }
        .h1 { font-size: 18px; font-weight: 700; margin: 0; }
        .muted { color: #6b7280; font-size: 12px; margin-top: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
        .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .02em; }
        .value { font-size: 13px; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
        th { background: #f9fafb; text-align: left; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px; }
        .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; }
        .stat .n { font-size: 16px; font-weight: 700; }
        .stat .k { color: #6b7280; font-size: 11px; margin-top: 2px; }
        .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <p class="h1">${escapeHtml(reportType)}</p>
          <div class="muted">${escapeHtml(term ? `Term: ${term}` : '')}</div>
        </div>
        <div class="muted" style="text-align:right;">
          <div>Generated: ${escapeHtml(generatedAt)}</div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="label">Student</div>
          <div class="value"><b>${escapeHtml(studentName)}</b></div>
          <div class="muted">${escapeHtml(className ? `Class: ${className}` : '')}${className && admission ? ' • ' : ''}${escapeHtml(admission ? `Admission: ${admission}` : '')}</div>
        </div>
        <div class="card">
          <div class="label">Overall</div>
          <div class="summary">
            <div class="stat"><div class="n">${escapeHtml(marks.averagePercent ?? 0)}%</div><div class="k">Average</div></div>
            <div class="stat"><div class="n">${escapeHtml(marks.overallGrade ?? '')}</div><div class="k">Grade</div></div>
            <div class="stat"><div class="n">${escapeHtml(attendance.attendanceRate ?? 0)}%</div><div class="k">Attendance</div></div>
            <div class="stat"><div class="n">${escapeHtml(subjects.length)}</div><div class="k">Subjects</div></div>
          </div>
        </div>
      </div>

      <div class="grid" style="margin-top: 12px;">
        <div class="card">
          <div class="label">Attendance Summary</div>
          <div class="summary">
            <div class="stat"><div class="n">${escapeHtml(attendance.totalDays ?? 0)}</div><div class="k">Total Days</div></div>
            <div class="stat"><div class="n">${escapeHtml(attendance.presentDays ?? 0)}</div><div class="k">Present</div></div>
            <div class="stat"><div class="n">${escapeHtml(attendance.absentDays ?? 0)}</div><div class="k">Absent</div></div>
            <div class="stat"><div class="n">${escapeHtml(attendance.lateDays ?? 0)}</div><div class="k">Late</div></div>
          </div>
        </div>
        <div class="card">
          <div class="label">Notes</div>
          <div class="value">This PDF is generated from the stored report data.</div>
          <div class="muted">You can regenerate after marks/attendance updates.</div>
        </div>
      </div>

      <div class="card" style="margin-top: 12px;">
        <div class="label">${isAnnual ? 'Marks (all three terms)' : 'Marks'}</div>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              ${isAnnual ? '<th style="text-align:right;">First Term %</th><th style="text-align:right;">Second Term %</th><th style="text-align:right;">Third Term %</th>' : '<th>Exam</th><th style="text-align:right;">Marks</th><th style="text-align:right;">Total</th>'}
              <th style="text-align:right;">${isAnnual ? 'Annual %' : '%'}</th>
              <th style="text-align:center;">Grade</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="${isAnnual ? 6 : 6}" style="text-align:center;color:#6b7280;">No marks available</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div>Digital Iskole</div>
        <div>${escapeHtml(title)}</div>
      </div>
    </body>
  </html>`;

  return { html, filename };
}

export function buildClassReportHtml(reportData: any): { html: string; filename: string } {
  const className = reportData?.class?.name || reportData?.className || 'Class';
  const teacher = reportData?.class?.teacher || 'Not assigned';
  const studentCount = reportData?.class?.studentCount ?? reportData?.class?.students ?? 0;
  const term = reportData?.term || '';
  const reportType = reportData?.reportType || 'Class Report';
  const generatedAt = reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : new Date().toLocaleString();

  const title = `${className} - ${reportType}${term ? ` (${term})` : ''}`;
  const filename = safeFilename(`${title}.pdf`) || `report.pdf`;

  const students: any[] = Array.isArray(reportData?.students) ? reportData.students : [];
  const topStudents: any[] = Array.isArray(reportData?.topStudents) ? reportData.topStudents : [];

  const studentRows = students
    .map((s, idx) => {
      const name = escapeHtml(s.studentName || '');
      const rollNo = escapeHtml(s.rollNo || '');
      const avg = escapeHtml(`${s?.marks?.averagePercent ?? 0}%`);
      const grade = escapeHtml(s?.marks?.overallGrade ?? '');
      const att = escapeHtml(`${s?.attendance?.attendanceRate ?? 0}%`);
      return `<tr>
        <td style="text-align:right;">${idx + 1}</td>
        <td>${rollNo}</td>
        <td>${name}</td>
        <td style="text-align:right;">${avg}</td>
        <td style="text-align:center;">${grade}</td>
        <td style="text-align:right;">${att}</td>
      </tr>`;
    })
    .join('');

  const topRows = topStudents
    .map((s) => {
      const rank = escapeHtml(s.rank ?? '');
      const name = escapeHtml(s.studentName || '');
      const rollNo = escapeHtml(s.rollNo || '');
      const avg = escapeHtml(`${s?.marks?.averagePercent ?? 0}%`);
      const att = escapeHtml(`${s?.attendance?.attendanceRate ?? 0}%`);
      return `<tr>
        <td style="text-align:right;">${rank}</td>
        <td>${rollNo}</td>
        <td>${name}</td>
        <td style="text-align:right;">${avg}</td>
        <td style="text-align:right;">${att}</td>
      </tr>`;
    })
    .join('');

  const summary = reportData?.summary || {};

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 24px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px; }
        .h1 { font-size: 18px; font-weight: 700; margin: 0; }
        .muted { color: #6b7280; font-size: 12px; margin-top: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
        .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .02em; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
        th { background: #f9fafb; text-align: left; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px; }
        .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; }
        .stat .n { font-size: 16px; font-weight: 700; }
        .stat .k { color: #6b7280; font-size: 11px; margin-top: 2px; }
        .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <p class="h1">${escapeHtml(reportType)}</p>
          <div class="muted">${escapeHtml(term ? `Term: ${term}` : '')}</div>
          <div class="muted">${escapeHtml(className)} • ${escapeHtml(teacher)}</div>
        </div>
        <div class="muted" style="text-align:right;">
          <div>Generated: ${escapeHtml(generatedAt)}</div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="label">Class</div>
          <div style="font-size:14px; font-weight:700;">${escapeHtml(className)}</div>
          <div class="muted">Teacher: ${escapeHtml(teacher)}</div>
        </div>
        <div class="card">
          <div class="label">Summary</div>
          <div class="summary">
            <div class="stat"><div class="n">${escapeHtml(studentCount)}</div><div class="k">Students</div></div>
            <div class="stat"><div class="n">${escapeHtml(summary.classAverageMarks ?? 0)}%</div><div class="k">Avg Marks</div></div>
            <div class="stat"><div class="n">${escapeHtml(summary.classAttendanceRate ?? 0)}%</div><div class="k">Attendance</div></div>
            <div class="stat"><div class="n">${escapeHtml(topStudents.length)}</div><div class="k">Top Listed</div></div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 12px;">
        <div class="label">Top Students</div>
        <table>
          <thead>
            <tr>
              <th style="width:50px;">Rank</th>
              <th style="width:90px;">Roll</th>
              <th>Name</th>
              <th style="width:90px; text-align:right;">Avg %</th>
              <th style="width:110px; text-align:right;">Attendance</th>
            </tr>
          </thead>
          <tbody>
            ${topRows || `<tr><td colspan="5" style="text-align:center;color:#6b7280;">No data</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="card" style="margin-top: 12px;">
        <div class="label">All Students</div>
        <table>
          <thead>
            <tr>
              <th style="width:50px; text-align:right;">#</th>
              <th style="width:90px;">Roll</th>
              <th>Name</th>
              <th style="width:90px; text-align:right;">Avg %</th>
              <th style="width:80px; text-align:center;">Grade</th>
              <th style="width:110px; text-align:right;">Attendance</th>
            </tr>
          </thead>
          <tbody>
            ${studentRows || `<tr><td colspan="6" style="text-align:center;color:#6b7280;">No students</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div>Digital Iskole</div>
        <div>${escapeHtml(title)}</div>
      </div>
    </body>
  </html>`;

  return { html, filename };
}

export function buildSchoolReportHtml(reportData: any): { html: string; filename: string } {
  const term = reportData?.term || '';
  const reportType = reportData?.reportType || 'School Report';
  const generatedAt = reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : new Date().toLocaleString();

  const title = `School - ${reportType}${term ? ` (${term})` : ''}`;
  const filename = safeFilename(`${title}.pdf`) || `report.pdf`;

  const summary = reportData?.summary || {};
  const classes: any[] = Array.isArray(reportData?.classes) ? reportData.classes : [];
  const topStudents: any[] = Array.isArray(reportData?.topStudents) ? reportData.topStudents : [];

  const classRows = classes
    .map((c) => {
      return `<tr>
        <td>${escapeHtml(c.className || '')}</td>
        <td>${escapeHtml(c.teacher || '')}</td>
        <td style="text-align:right;">${escapeHtml(c.students ?? 0)}</td>
        <td style="text-align:right;">${escapeHtml(c.averageMarks ?? 0)}%</td>
        <td style="text-align:right;">${escapeHtml(c.attendanceRate ?? 0)}%</td>
      </tr>`;
    })
    .join('');

  const topRows = topStudents
    .map((s) => {
      return `<tr>
        <td style="text-align:right;">${escapeHtml(s.rank ?? '')}</td>
        <td>${escapeHtml(s.name || '')}</td>
        <td>${escapeHtml(s.className || '')}</td>
        <td style="text-align:right;">${escapeHtml(s.averagePercent ?? 0)}%</td>
        <td style="text-align:center;">${escapeHtml(s.grade ?? '')}</td>
      </tr>`;
    })
    .join('');

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 24px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px; }
        .h1 { font-size: 18px; font-weight: 700; margin: 0; }
        .muted { color: #6b7280; font-size: 12px; margin-top: 4px; }
        .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
        .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .02em; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
        th { background: #f9fafb; text-align: left; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
        .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; }
        .stat .n { font-size: 16px; font-weight: 700; }
        .stat .k { color: #6b7280; font-size: 11px; margin-top: 2px; }
        .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <p class="h1">${escapeHtml(reportType)}</p>
          <div class="muted">${escapeHtml(term ? `Term: ${term}` : '')}</div>
        </div>
        <div class="muted" style="text-align:right;">
          <div>Generated: ${escapeHtml(generatedAt)}</div>
        </div>
      </div>

      <div class="card">
        <div class="label">School Summary</div>
        <div class="summary">
          <div class="stat"><div class="n">${escapeHtml(summary.totalStudents ?? 0)}</div><div class="k">Students</div></div>
          <div class="stat"><div class="n">${escapeHtml(summary.totalClasses ?? 0)}</div><div class="k">Classes</div></div>
          <div class="stat"><div class="n">${escapeHtml(summary.totalTeachers ?? 0)}</div><div class="k">Teachers</div></div>
        </div>
      </div>

      <div class="card" style="margin-top: 12px;">
        <div class="label">Class-wise Performance</div>
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Teacher</th>
              <th style="text-align:right;">Students</th>
              <th style="text-align:right;">Avg %</th>
              <th style="text-align:right;">Attendance</th>
            </tr>
          </thead>
          <tbody>
            ${classRows || `<tr><td colspan="5" style="text-align:center;color:#6b7280;">No classes</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="card" style="margin-top: 12px;">
        <div class="label">Top Students (School-wide)</div>
        <table>
          <thead>
            <tr>
              <th style="width:60px;">Rank</th>
              <th>Name</th>
              <th style="width:140px;">Class</th>
              <th style="width:90px; text-align:right;">Avg %</th>
              <th style="width:70px; text-align:center;">Grade</th>
            </tr>
          </thead>
          <tbody>
            ${topRows || `<tr><td colspan="5" style="text-align:center;color:#6b7280;">No data</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div>Digital Iskole</div>
        <div>${escapeHtml(title)}</div>
      </div>
    </body>
  </html>`;

  return { html, filename };
}

export async function renderHtmlToPdfBuffer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

