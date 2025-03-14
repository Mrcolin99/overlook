//Imports
import './css/styles.css'
import './images/turing-logo.png'
import apiCalls from './fetchApi'
import Customer from './classes/customer'
import { post } from './fetchApi'


//Query Selectors
const welcome = document.querySelector('.welcome')
const bookingsList = document.querySelector('.bookings-list')
const totalCostOfBookings = document.querySelector('.total-booking-cost')
const bookingYear = document.getElementById('year')
const bookingMonth = document.getElementById('month')
const bookingDay = document.getElementById('day')
const roomTypeSelector = document.getElementById('room-type')
const bookingButton = document.getElementById('booking-button')
const availableBookingSection = document.querySelector('.available-bookings')
const loginButton = document.querySelector('.login-button')
const usernameInput = document.querySelector('.username')
const passwordInput = document.querySelector('.password')
const loginError = document.querySelector('.error-msg')
const mainPage = document.querySelector('.hidden')
const loginPage = document.querySelector('.login')

//Variables
let bookings
let rooms
let customers
let singleCustomer
let currentCustomer
let customersRooms = []
let unavailable = []
let available = []
let roomFilter
let idNumber

//Functions
function logIn(event) {
    parseUsername()
    if (passwordInput.value === 'overlook2021' && idNumber <= 50) {
        fetchApiCalls(idNumber)
        showMainPage()
    } else { loginError.innerHTML = 'Sorry there was an error trying to log you in, please try again' }
    event.preventDefault()
}

function parseUsername() {
    let usernameSplit = []
    let username = usernameInput.value
    let split = username.split('')
    usernameSplit.push(split[8], split[9])
    username = usernameSplit.join('')
    idNumber = parseInt(username)
}

function showMainPage() {
    mainPage.className = "main"
    loginPage.className = "hidden"
}

const fetchApiCalls = (user) => {
    apiCalls.fetchData(user).then(data => {
        bookings = data[0].bookings
        rooms = data[1].rooms
        customers = data[2].customers
        singleCustomer = data[3]
        console.log(singleCustomer)
        loadHandler()
    })
}

function loadHandler() {
    currentCustomer = new Customer(singleCustomer, bookings)
    welcomeMessage()
    setTimeout(() => { totalBookingsCost() }, 1000)
    setTimeout(() => { displayUserData() }, 1000)
}

function welcomeMessage() {
    welcome.innerHTML = `Welcome to Overlook ${singleCustomer.name}!`
}

function totalBookingsCost() {
    currentCustomer.findAllBookings()
    currentCustomer.sortBookings()
    currentCustomer.customersBookings.forEach(booking => {
        customersRooms.push(rooms.filter(room => room.number === booking.roomNumber)[0])
    })
    return Math.round(customersRooms.reduce((acc, cur) => {
        return cur.costPerNight + acc
    }, 0) * 100) / 100
}

function displayUserData() {
    bookingsList.innerHTML = ''
    currentCustomer.customersBookings.forEach(booking => {
        bookingsList.insertAdjacentHTML('beforeend', `<p id="${booking.id}">${booking.date} Room Number: ${booking.roomNumber}</p>`)
    })
    totalCostOfBookings.innerHTML = `<p>You've spent: $${totalBookingsCost()}`
}

function checkInputs(event) {
    if (bookingYear.value === "Year") {
        availableBookingSection.innerHTML = '<p>Please select a year!</p>'
    } else if (bookingMonth.value === "Month") {
        availableBookingSection.innerHTML = '<p>Please select a month!</p>'
    } else if (bookingDay.value === "Day") {
        availableBookingSection.innerHTML = '<p>Please select a day!</p>'
    } else { filterNewBooking() }
    event.preventDefault()

}

function filterNewBooking() {
    unavailable = []
    available = []
    let unavailableRooms = bookings.filter(booking => booking.date === `${bookingYear.value}/${bookingMonth.value}/${bookingDay.value}`)
    unavailableRooms.forEach(room =>
        unavailable.push(room.roomNumber)
    )
    rooms.forEach(room => {
        if (unavailable.includes(room.number)) {
            return
        } else { available.push(room) }
    })
    showAvailableBookings()
}

function showAvailableBookings() {
    availableBookingSection.innerHTML = ''
    available.forEach(booking => {
        availableBookingSection.insertAdjacentHTML('beforeend', `<p id="${booking.number}">Bed Size: ${booking.bedSize}, Room Type: ${booking.roomType}, Bidet: ${booking.bidet}, Cost(per night): ${booking.costPerNight}, Number of Beds: ${booking.numBeds}, Room Number: ${booking.number}</p>`)
    })
    checkForUnavailable()
}

function filterByRoomType() {
    if (roomTypeSelector.value != "Room Type") { filterResults() } else { return }
}

function filterResults() {
    availableBookingSection.innerHTML = ''
    roomFilter = available.filter(room => room.roomType === roomTypeSelector.value)
    roomFilter.forEach(booking => {
        availableBookingSection.insertAdjacentHTML('beforeend', `<p id="${booking.number}">Bed Size: ${booking.bedSize}, Room Type: ${booking.roomType}, Bidet: ${booking.bidet}, Cost (per night): ${booking.costPerNight}, Number of Beds: ${booking.numBeds}, Room Number: ${booking.number}</p>`)
    })
    checkForUnavailable()
}

function checkForUnavailable() {
    if (unavailable === [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]) {
        availableBookingSection.innerHTML = `<p> We are so sorry but there seems to be no available bookings for that day!</p>`
    }
}

function createNewBooking(event) {
    const bookedRoom = rooms.filter(room => parseInt(event.target.id) === room.number)
    const objectString = JSON.stringify({ userID: currentCustomer.id, date: `${bookingYear.value}/${bookingMonth.value}/${bookingDay.value}`, roomNumber: bookedRoom[0].number })
    post(objectString)
    availableBookingSection.innerHTML = ''
    setTimeout(() => { fetchApiCalls(idNumber) }, 1000)
}

//Event Listeners
loginButton.addEventListener('click', logIn)
bookingButton.addEventListener('click', checkInputs)
bookingButton.addEventListener('click', filterByRoomType)
availableBookingSection.addEventListener('dblclick', createNewBooking)
