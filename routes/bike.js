const express = require('express')
const router = express.Router()
const { readData, writeData } = require('../data/store')


function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}



router.get('/status/:nationalId', (req, res) => {
  const data = readData()
  const nationalId = req.params.nationalId

  const active = data.rentals.find(r => r.nationalId === nationalId && !r.returned)

  if (active) {
    return res.json({
      hasBike: true,
      bikeId: active.bikeId,
      code: active.code
    })
  }

  res.json({ hasBike: false })
})


router.post('/rent', (req, res) => {
  const { nationalId } = req.body
  if (!nationalId) return res.status(400).json({ message: 'nationalId required' })

  const data = readData()

  const already = data.rentals.find(r => r.nationalId === nationalId && !r.returned)
  if (already) {
    return res.json({ message: 'شما قبلاً دوچرخه گرفته‌اید' })
  }

  const bike = data.bikes.find(b => b.available)
  if (!bike) {
    return res.json({ message: 'دوچرخه موجود نیست' })
  }

  bike.available = false

  const code = generateCode()

  data.rentals.push({
    nationalId,
    bikeId: bike.id,
    code,
    startTime: Date.now(),
    returned: false
  })

  writeData(data)

  res.json({
    message: 'دوچرخه تحویل شد',
    bikeId: bike.id,
    code
  })
})



router.post('/return', (req, res) => {
  const { code } = req.body

  const data = readData()

  const rental = data.rentals.find(r => r.code === code && !r.returned)
  if (!rental) return res.status(404).json({ message: 'کد نامعتبر' })

  rental.returned = true

  const bike = data.bikes.find(b => b.id === rental.bikeId)
  bike.available = true

  const hours = Math.ceil((Date.now() - rental.startTime) / (1000 * 60 * 60))
  const cost = hours * 10000

  writeData(data)

  res.json({
    message: 'تحویل گرفته شد',
    hours,
    cost
  })
})

module.exports = router

