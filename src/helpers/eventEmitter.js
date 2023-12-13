import { ref } from "vue";

const qrCodeEmitter = ref("");

function emitQRCode(qrCodeData) {
  qrCodeEmitter.value = qrCodeData;
}

export { qrCodeEmitter, emitQRCode };
