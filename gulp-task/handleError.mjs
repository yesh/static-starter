import beeper from 'beeper'

export const handleError = (err) => {
  console.log(`\n Error:`, `\n ${err.message}\n`)
  beeper(2)
  // this.emit('end')
}
