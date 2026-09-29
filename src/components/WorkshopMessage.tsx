import React from 'react';
import {Text, View, StyleSheet, Platform} from 'react-native';

const inline = (text: string) => text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g).map((span, index) => {
  if (span.startsWith('**')) return <Text key={index} style={styles.bold}>{span.slice(2, -2)}</Text>;
  if (span.startsWith('*')) return <Text key={index} style={styles.italic}>{span.slice(1, -1)}</Text>;
  if (span.startsWith('`')) return <Text key={index} style={styles.inlineCode}>{span.slice(1, -1)}</Text>;
  return span;
});
const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());

/** Native Markdown subset. Tables become stacked rows that fit narrow iPhones. */
export const WorkshopMessage = ({text}: {text: string}) => <View style={styles.blocks}>{text.split(/(```[\s\S]*?```)/g).filter(Boolean).map((part, index) => {
  if (part.startsWith('```')) {
    const body = part.slice(3, -3); const newline = body.indexOf('\n');
    return <View key={index} style={styles.code}><Text style={styles.language}>{newline >= 0 ? body.slice(0, newline) || 'Code' : 'Code'}</Text><Text selectable style={styles.codeText}>{newline >= 0 ? body.slice(newline + 1).trimEnd() : body}</Text></View>;
  }
  return part.trim().split(/\n\s*\n/).filter(Boolean).map((paragraph, block) => {
    const key = `${index}-${block}`;
    const lines = paragraph.split('\n');
    if (lines.length > 1 && lines[0].includes('|') && cells(lines[1]).every(cell => /^:?-{3,}:?$/.test(cell))) {
      const headers = cells(lines[0]);
      return <View key={key} style={styles.table}>{lines.slice(2).filter(line => line.trim()).map((line, row) => <View key={row} style={styles.tableRow}>{cells(line).map((cell, column) => <View key={column} style={styles.tableCell}><Text style={styles.language}>{headers[column] || ''}</Text><Text selectable style={styles.body}>{inline(cell)}</Text></View>)}</View>)}</View>;
    }
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(paragraph)) return <View key={key} style={styles.rule} />;
    return <View key={key} style={styles.paragraph}>{lines.map((line, row) => {
      const heading = /^#{1,6}\s/.test(line); const quote = /^>\s?/.test(line);
      const content = line.replace(/^#{1,6}\s/, '').replace(/^>\s?/, '').replace(/^[-*]\s/, '• ');
      return <Text key={row} selectable style={[styles.body, heading && styles.heading, quote && styles.quote]}>{inline(content)}</Text>;
    })}</View>;
  });
})}</View>;

const styles = StyleSheet.create({
  blocks: {gap: 12},
  paragraph: {gap: 5},
  body: {fontSize: 15, lineHeight: 23, color: '#0F172A'},
  heading: {fontSize: 17, lineHeight: 24, fontWeight: '700'},
  bold: {fontWeight: '700'},
  italic: {fontStyle: 'italic'},
  quote: {borderLeftWidth: 3, borderLeftColor: '#5653FE', paddingLeft: 12, color: '#475569'},
  rule: {height: 1, backgroundColor: '#E2E8F0', marginVertical: 5},
  code: {
    backgroundColor: '#090D16',
    padding: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginVertical: 4
  },
  language: {
    fontSize: 11,
    lineHeight: 16,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#4ADE80'
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#F1F5F9',
    color: '#5653FE',
    fontSize: 13.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  table: {gap: 10},
  tableRow: {paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 9},
  tableCell: {gap: 3},
});
