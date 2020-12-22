/*
 * This code is provided solely for the personal and private use of students
 * taking the CSC309H course at the University of Toronto. Copying for purposes
 * other than this use is expressly prohibited. All forms of distribution of
 * this code, including but not limited to public repositories on GitHub,
 * GitLab, Bitbucket, or any other online platform, whether as given or with
 * any changes, are expressly prohibited.
*/

/* Reservations.js */ 
'use strict';

const log = console.log
const fs = require('fs');
const datetime = require('date-and-time')

const startSystem = () => {

	let status = {};

	try {
		status = getSystemStatus();
	} catch(e) {
		status = {
			numRestaurants: 0,
			totalReservations: 0,
			currentBusiestRestaurantName: null,
			systemStartTime: new Date(),
		}

		fs.writeFileSync('status.json', JSON.stringify(status))
	}

	return status;
}

/*********/


// You may edit getSystemStatus below.  You will need to call updateSystemStatus() here, which will write to the json file
const getSystemStatus = () => {
	updateSystemStatus()
	const status = fs.readFileSync('status.json')
	return JSON.parse(status)
}

/* Helper functions to save JSON */
// You can add arguments to updateSystemStatus if you want.
const updateSystemStatus = () => {
	/* Add your code below */
	const numRestaurants = getAllRestaurants().length
	const totalReservations = getAllReservations().length
	const currentBusiestRestaurantName = getAllRestaurants().reduce(function(accumulator, restaurant){
		if(restaurant.numReservations > accumulator.numReservations) return restaurant
		else return accumulator
	}, getAllRestaurants()[0]).name;
	const systemStartTime = JSON.parse(fs.readFileSync('status.json')).systemStartTime
	const status = {
		numRestaurants,
		totalReservations,
		currentBusiestRestaurantName,
		systemStartTime,
	}

	fs.writeFileSync('status.json', JSON.stringify(status))
	return status
}

const saveRestaurantsToJSONFile = (restaurants) => {
	/* Add your code below */
	fs.writeFileSync('restaurants.json', JSON.stringify(restaurants))
};

const saveReservationsToJSONFile = (reservations) => {
	/* Add your code below */
	fs.writeFileSync('reservations.json', JSON.stringify(reservations))
};

/*********/

// Should return an array of length 0 or 1.
const addRestaurant = (name, description) => {
	// Check for duplicate names
	const restaurants = getAllRestaurants()
	const duplicate = restaurants.filter((restaurant) => restaurant.name === name)

	if(duplicate.length){
		return [];
	}

	// if no duplicate names:
	const restaurant = {
		name,
		description,
		numReservations: 0
	}

	restaurants.push(restaurant)
	saveRestaurantsToJSONFile(restaurants)
	return [restaurant];
}

// should return the added reservation object
const addReservation = (restaurant, time, people) => {
	/* Add your code below */
	const timeInDate = new Date(time)
	const reservation = {
		restaurant,
		time: timeInDate,
		people
	}

	// push to reservations
	const reservations = getAllReservations()
	reservations.push(reservation)
	saveReservationsToJSONFile(reservations)

	// update numReservations
	const restaurants = getAllRestaurants();
	const restaurantMatch = restaurants.filter((elem)=>elem.name === restaurant)
	restaurantMatch[0].numReservations++
	saveRestaurantsToJSONFile(restaurants)
	return reservation;
}


/// Getters - use functional array methods when possible! ///
// Should return an array - check to make sure restaurants.json exists
const getAllRestaurants = () => {
	/* Add your code below */
	try {
		const restaurantsFromFile = fs.readFileSync('restaurants.json')
		return JSON.parse(restaurantsFromFile)
	} catch(e) {
		return []
	}
};

// Should return the restaurant object if found, or an empty object if the restaurant is not found.
const getRestaurantByName = (name) => {
	/* Add your code below */
	const restaurants = getAllRestaurants()
	const restaurant = restaurants.filter((restaurant)=> restaurant.name === name)
	if(restaurant.length){
		return restaurant[0]
	} else {
		return {}
	}
};

// Should return an array - check to make sure reservations.json exists
const getAllReservations = () => {
  	/* Add your code below */
	try {
		const reservationsFromFile = fs.readFileSync('reservations.json')
		return JSON.parse(reservationsFromFile)
	} catch(e) {
		return []
	}
};

// Should return an array
const getAllReservationsForRestaurant = (name) => {
	/* Add your code below */
	const reservations = getAllReservations();
	const allReservationsForRestaurant = reservations.filter((reservation)=> reservation.restaurant === name)
	return allReservationsForRestaurant.sort(function(a,b){
		if(a.time < b.time){
			return -1
		}else if(a.time > b.time){
			return 1
		}else{
			return 0
		}
	})
};


// Should return an array
const getReservationsForHour = (time) => {
	/* Add your code below */
	const reservations = getAllReservations()
	const reservationsForHour = reservations.filter((reservation)=>
		datetime.subtract(new Date(reservation.time), new Date(time)).toHours()>=0 &&
		datetime.subtract(new Date(reservation.time), new Date(time)).toHours()<1)
	return reservationsForHour
}

// should return a reservation object
const checkOffEarliestReservation = (restaurantName) => {
	// update reservations
	const reservations = getAllReservations()
	reservations.sort(function(a,b){
		if(a.time < b.time){
			return -1
		}else if(a.time > b.time){
			return 1
		}else{
			return 0
		}
	})
	let checkedOffReservation = null;
	for(let i = 0; i < reservations.length; i++){
		if(reservations[i].restaurant === restaurantName){
			checkedOffReservation = reservations[i]
			reservations.splice(i, 1)
			break;
		}
	}
	saveReservationsToJSONFile(reservations)

	// update restaurant.json
	const restaurants = getAllRestaurants()
	const restaurant = restaurants.filter((item)=> item.name === restaurantName)
	restaurant[0].numReservations--;
	saveRestaurantsToJSONFile(restaurants)
 	return checkedOffReservation;
}


const addDelayToReservations = (restaurant, minutes) => {
	// Hint: try to use a functional array method
	const reservations = getAllReservations();
	const delayedReservations = reservations.map((reservation)=>{
		if(reservation.restaurant === restaurant){
			reservation.time = datetime.addMinutes(new Date(reservation.time), minutes)
		}
		return reservation
	})
	saveReservationsToJSONFile(delayedReservations)
	return getAllReservationsForRestaurant(restaurant)
}

startSystem(); // start the system to create status.json (should not be called in app.js)


// DO NOT modify the contents of module.exports.  You may not need all of these in app.js..but they're here.
module.exports = {
	addRestaurant,
	getSystemStatus,
	getRestaurantByName,
	getAllRestaurants,
	getAllReservations,
	getAllReservationsForRestaurant,
	addReservation,
	checkOffEarliestReservation,
	getReservationsForHour,
	addDelayToReservations
}

