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
  blocks: {gap: 12}, paragraph: {gap: 5}, body: {fontSize: 16, lineHeight: 25, color: '#2E2939'},
  heading: {fontSize: 18, lineHeight: 26, fontWeight: '700'}, bold: {fontWeight: '700'}, italic: {fontStyle: 'italic'},
  quote: {borderLeftWidth: 2, borderLeftColor: '#C8B9E4', paddingLeft: 12, color: '#665577'}, rule: {height: 1, backgroundColor: '#E9E3F0', marginVertical: 5},
  code: {backgroundColor: '#F1EFF5', padding: 14, borderRadius: 13, gap: 10}, language: {fontSize: 11, lineHeight: 16, color: '#776E87', fontWeight: '600'},
  codeText: {fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, lineHeight: 19, color: '#312A41'},
  inlineCode: {fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', backgroundColor: '#F1EFF5', fontSize: 14},
  table: {gap: 10}, tableRow: {paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E9E3F0', gap: 9}, tableCell: {gap: 3},
});
