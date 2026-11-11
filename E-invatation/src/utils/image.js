function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('read-failed'))
    reader.readAsDataURL(file)
  })
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image-failed'))
    image.src = source
  })
}

export function dataUrlToBlob(dataUrl) {
  const [header, base64] = String(dataUrl || '').split(',')
  if (!base64) throw new Error('invalid-data-url')
  const mime = /:(.*?);/.exec(header)?.[1] || 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: mime })
}

export async function prepareImage(file, maxDimension = 1400) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('not-an-image')
  }

  const source = await readFile(file)
  const image = await loadImage(source)
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, width, height)

  let result = canvas.toDataURL('image/jpeg', 0.82)
  if (result.length > 1_100_000) {
    result = canvas.toDataURL('image/jpeg', 0.62)
  }

  return result
}
