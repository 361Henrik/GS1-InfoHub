import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import type { Run, Source, InsightDocument, FoundationDocument } from './types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[øö]/g, 'o')
    .replace(/[åä]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function heading(text: string, level = HeadingLevel.HEADING_2): Paragraph {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 100 } });
}

function body(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, size: 22 })], spacing: { after: 80 } });
}

function bullet(text: string, ks = false): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    children: ks
      ? [new TextRun({ text: '[KS] ', bold: true, color: 'C87963', size: 22 }), new TextRun({ text, size: 22 })]
      : [new TextRun({ text, size: 22 })],
    spacing: { after: 60 },
  });
}

function divider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E6E5E0' } },
    spacing: { before: 200, after: 200 },
    text: '',
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportInsightDocument(source: Source, doc: InsightDocument): Promise<void> {
  const c = doc.content;
  const sourceLabel = source.title ?? source.url ?? source.pdf_path ?? 'Kilde';

  const children: Paragraph[] = [
    new Paragraph({ text: 'Innsiktsdokument', heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: sourceLabel, italics: true, size: 22, color: '666A6D' })], spacing: { after: 200 } }),
    divider(),
  ];

  if (c) {
    if (c.summary?.length) {
      children.push(heading('Sammendrag'));
      c.summary.forEach(s => children.push(bullet(s)));
    }

    if (c.key_facts?.length) {
      children.push(heading('Nøkkelfakta'));
      c.key_facts.forEach(f => children.push(bullet(`${f.fact} (${f.source_ref})`)));
    }

    if (c.use_cases?.length) {
      children.push(heading('Brukstilfeller'));
      c.use_cases.forEach(u => children.push(bullet(`${u.case} — ${u.value} (${u.source_ref})`)));
    }

    if (c.narrative) {
      children.push(heading('Historie og budskapslinje'));
      children.push(body(`Rød tråd: ${c.narrative.red_thread}`));
      children.push(body(`Hovedbudskap: ${c.narrative.main_message}`));
      if (c.narrative.support_messages?.length) {
        c.narrative.support_messages.forEach(m => children.push(bullet(m)));
      }
    }

    if (c.examples?.length) {
      children.push(heading('Eksempler'));
      c.examples.forEach(e => children.push(bullet(`${e.example} (${e.source_ref})`)));
    }

    if (c.risks?.length) {
      children.push(heading('Risiko og forbehold'));
      c.risks.forEach(r => children.push(bullet(`${r.risk} — ${r.reason}`, r.ks_required)));
    }

    if (c.safe_phrases?.length) {
      children.push(heading('Trygge formuleringer'));
      c.safe_phrases.forEach(p => children.push(bullet(p)));
    }
  }

  const document = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(document);
  triggerDownload(blob, `infohub-innsikt-${slugify(sourceLabel)}-${todayStr()}.docx`);
}

export async function exportFoundationDocument(run: Run, doc: FoundationDocument): Promise<void> {
  const c = doc.content;
  const runTitle = run.title;

  const children: Paragraph[] = [
    new Paragraph({ text: 'Grunnlagsdokument', heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: runTitle, italics: true, size: 22, color: '666A6D' })], spacing: { after: 200 } }),
    divider(),
  ];

  if (c) {
    if (c.purpose_audience) {
      children.push(heading('Formål og målgruppe'));
      children.push(body(c.purpose_audience));
    }

    if (c.key_facts?.length) {
      children.push(heading('Nøkkelfakta'));
      c.key_facts.forEach(f => children.push(bullet(`${f.fact} (${f.source})`)));
    }

    if (c.use_cases?.length) {
      children.push(heading('Brukstilfeller'));
      c.use_cases.forEach(u => children.push(bullet(`${u.case} — ${u.value} — GS1s rolle: ${u.gs1_role}`)));
    }

    if (c.narrative) {
      children.push(heading('Budskapslinje'));
      children.push(body(`Rød tråd: ${c.narrative.red_thread}`));
      children.push(body(`Anbefalt vinkling: ${c.narrative.recommended_angle}`));
      if (c.narrative.support_points?.length) {
        c.narrative.support_points.forEach(p => children.push(bullet(p)));
      }
    }

    if (c.examples?.length) {
      children.push(heading('Eksempler'));
      c.examples.forEach(e => children.push(bullet(`${e.example} — Viser: ${e.shows} (${e.source})`)));
    }

    if (c.risks?.length) {
      children.push(heading('Risiko og forbehold'));
      c.risks.forEach(r => children.push(bullet(`${r.statement} — ${r.concern}`, r.ks_required)));
    }

    if (c.glossary?.length) {
      children.push(heading('Begrepsordliste'));
      const rows = c.glossary.map(g =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: g.term, bold: true, size: 20 })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: g.definition, size: 20 })] })] }),
          ],
        })
      );
      children.push(new Paragraph({ text: '' }));
      // @ts-expect-error docx Table accepted as child
      children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }

    if (c.sources?.length) {
      children.push(heading('Kilder'));
      c.sources.forEach(s => children.push(bullet(`${s.title} — ${s.url_or_name}`)));
    }
  }

  if (doc.user_notes) {
    children.push(divider());
    children.push(heading('Redaktørnotater'));
    children.push(body(doc.user_notes));
  }

  const document = new Document({
    sections: [{ children }],
    creator: 'GS1 InfoHub',
    title: `Grunnlagsdokument — ${runTitle}`,
  });
  const blob = await Packer.toBlob(document);
  triggerDownload(blob, `infohub-grunnlag-${slugify(runTitle)}-${todayStr()}.docx`);
}
