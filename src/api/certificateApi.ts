import { NativeModules } from 'react-native';
import apiClient from './client';
import { learningRequest } from './learningTransport';
import { Certificate } from '../types';
const normalize = (certificate: Certificate): Certificate => ({...certificate,
  userName: certificate.recipientName || certificate.userName,
  certificateNumber: certificate.certificateId || certificate.certificateNumber,
  issueDate: certificate.issuedAt || certificate.issueDate,
});
export const certificateApi = {
  getMyCertificates: async () => { const r = await learningRequest<Certificate[]>('get', '/certificates/my-certificates'); return { ...r, data: r.data.map(normalize) }; },
  issueCertificate: async (courseId: string) => { const r = await learningRequest<Certificate>('post', '/certificates/issue', {courseId}); return {...r, data: normalize(r.data)}; },
  getCertificateById: async (id: string) => { const r = await learningRequest<Certificate>('get', `/certificates/${id}`); return {...r, data: normalize(r.data)}; },
  downloadCertificate: async (id: string) => {
    const response = await apiClient.get(`/certificates/${id}/download`, { responseType: 'arraybuffer' });
    const bytes = new Uint8Array(response.data);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let encoded = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const a = bytes[i], b = bytes[i + 1] || 0, c = bytes[i + 2] || 0;
      encoded += alphabet[a >> 2] + alphabet[((a & 3) << 4) | (b >> 4)] + (i + 1 < bytes.length ? alphabet[((b & 15) << 2) | (c >> 6)] : '=') + (i + 2 < bytes.length ? alphabet[c & 63] : '=');
    }
    if (!NativeModules.SpeechModule?.sharePdf) throw new Error('Rebuild the iOS app to enable PDF export.');
    await NativeModules.SpeechModule.sharePdf(encoded, `CrackWithAI-${id}.pdf`);
    return { success: true, message: 'Certificate export opened', data: { downloadUrl: '' } };
  },
  verifyCertificate: (code: string) => learningRequest<Certificate>('get', `/certificates/verify/${encodeURIComponent(code)}`),
};
