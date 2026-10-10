/**
 * Lê uma imagem escolhida pelo usuário e devolve uma versão reduzida em data URL (JPEG).
 * Fotos de celular passam fácil de 5 MB; sem reduzir, estouram o localStorage
 * e deixam o envio para a API pesado.
 */
export function reduzirImagem(arquivo: File, ladoMaximo = 800, qualidade = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = Math.min(1, ladoMaximo / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas indisponível'));
        return;
      }
      // Fundo branco para PNGs com transparência não ficarem pretos no JPEG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', qualidade));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Arquivo de imagem inválido'));
    };
    img.src = url;
  });
}
