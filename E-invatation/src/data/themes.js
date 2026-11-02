export const themes = [
  {
    id: 'classic',
    name: 'ក្រហមមាស',
    nameEn: 'Classic Maroon',
    description: 'ក្រហមស្រាបុរាណ និងមាសភ្លឺ សម្រាប់ពិធីមង្គលការខ្មែរប្រពៃណី។',
    swatches: ['#6d1f2e', '#c9a25c', '#fbf6ec'],
  },
  {
    id: 'emerald',
    name: 'មរកតមាស',
    nameEn: 'Emerald Gold',
    description: 'បៃតងមរកតជ្រៅ លាយមាសទន់ ផ្តល់អារម្មណ៍ស្ងប់ស្ងាត់ និងថ្លៃថ្នូរ។',
    swatches: ['#14503f', '#d4b56d', '#f4f7f1'],
  },
  {
    id: 'royal',
    name: 'ខៀវរាជ',
    nameEn: 'Royal Navy',
    description: 'ខៀវរាជវង្ស និងមាសភ្លឺ សម្រាប់ការអញ្ជើញដ៏អស្ចារ្យ។',
    swatches: ['#1d2f56', '#c9a25c', '#f5f3ec'],
  },
  {
    id: 'blush',
    name: 'កុលាបស្រាល',
    nameEn: 'Blush Romance',
    description: 'ផ្កាកុលាបស្រាល និងសម្បកស៊ីម៉ង់ ផ្តល់ភាពទន់ភ្លន់ និងស្នេហា។',
    swatches: ['#a85d6b', '#c9a25c', '#fdf4f1'],
  },
  {
    id: 'midnight',
    name: 'យប់រំលង',
    nameEn: 'Midnight Rose',
    description: 'ខ្មៅជ្រៅ និងផ្កាឈូកមាស សម្រាប់ការអញ្ជើញបែបទំនើប និងប្លែកភ្នែក។',
    swatches: ['#241f2b', '#d9a88f', '#f7f1ec'],
  },
]

export function getTheme(id) {
  return themes.find((theme) => theme.id === id) || themes[0]
}
