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
