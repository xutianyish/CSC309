/*
 * This code is provided solely for the personal and private use of students
 * taking the CSC309H course at the University of Toronto. Copying for purposes
 * other than this use is expressly prohibited. All forms of distribution of
 * this code, including but not limited to public repositories on GitHub,
 * GitLab, Bitbucket, or any other online platform, whether as given or with
 * any changes, are expressly prohibited.
*/

/* E3 app.js */

'use strict';

const log = console.log
const yargs = require('yargs').option('addRest', {
    type: 'array' // Allows you to have an array of arguments for particular command
  }).option('addResv', {
    type: 'array' 
  }).option('addDelay', {
    type: 'array' 
  })

const reservations = require('./reservations');

// datetime available if needed
const datetime = require('date-and-time') 
const meridiem = require('date-and-time/plugin/meridiem')
datetime.plugin(meridiem);

const yargs_argv = yargs.argv
//log(yargs_argv) // uncomment to see what is in the argument array

if ('addRest' in yargs_argv) {
	const args = yargs_argv['addRest']
	const rest = reservations.addRestaurant(args[0], args[1]);	
	if (rest.length > 0) {
		/* complete */ 
		log(`Added restaurant ${rest[0].name}.`)
	} else {
		/* complete */ 
		log("Duplicate restaurant not added.")
	}
}

if ('addResv' in yargs_argv) {
	const args = yargs_argv['addResv']
	const resv = reservations.addReservation(args[0], args[1], args[2]);

	// Produce output below
	log(`Added reservation at ${resv.restaurant} on ${datetime.format(resv.time, 'MMM DD YYYY [at] h:mm aa')} for ${resv.people} people.`)
}

if ('allRest' in yargs_argv) {
	const restaurants = reservations.getAllRestaurants(); // get the array
	
	// Produce output below
	restaurants.map(restaurant=>{
		log(`${restaurant.name}: ${restaurant.description} - ${restaurant.numReservations} active reservations`)
	})
}

if ('restInfo' in yargs_argv) {
	const restaurant = reservations.getRestaurantByName(yargs_argv['restInfo']);

	// Produce output below
	log(`${restaurant.name}: ${restaurant.description} - ${restaurant.numReservations} active reservations`)
}

if ('allResv' in yargs_argv) {
	const restaurantName = yargs_argv['allResv']
	const reservationsForRestaurant = reservations.getAllReservationsForRestaurant(restaurantName); // get the arary
	
	// Produce output below
	log(`Reservations for ${restaurantName}:`)
	reservationsForRestaurant.map((reservation)=>{
		log(`- ${datetime.format(new Date(reservation.time), 'MMM DD YYYY, h:mm aa')}, table for ${reservation.people}`)
	})
}

if ('hourResv' in yargs_argv) {
	const time = yargs_argv['hourResv']
	const reservationsForRestaurant = reservations.getReservationsForHour(time); // get the arary
	
	// Produce output below
	log("Reservations in the next hour:")
	reservationsForRestaurant.map((reservation)=>{
		log(`- ${reservation.restaurant}: ${datetime.format(new Date(reservation.time), 'MMM DD YYYY, h:mm aa')}, table for ${reservation.people}`)
	})
}

if ('checkOff' in yargs_argv) {
	const restaurantName = yargs_argv['checkOff']
	const earliestReservation = reservations.checkOffEarliestReservation(restaurantName); 
	
	// Produce output below
	log(`Checked off reservation on ${datetime.format(new Date(earliestReservation.time),
		'MMM DD YYYY, h:mm A')}, table for ${earliestReservation.people}`)
}

if ('addDelay' in yargs_argv) {
	const args = yargs_argv['addDelay']
	const resv = reservations.addDelayToReservations(args[0], args[1]);	

	// Produce output below
	log(`Reservations for ${args[0]}:`)
	resv.map((reservation)=>{
		log(`- ${datetime.format(new Date(reservation.time), 'MMM DD YYYY, h:mm aa')}, table for ${reservation.people}`)
	})
}

if ('status' in yargs_argv) {
	const status = reservations.getSystemStatus()

	// Produce output below
	log(`Number of restaurants: ${status.numRestaurants}`)
	log(`Number of total reservations: ${status.totalReservations}`)
	log(`Busiest restaurant: ${status.currentBusiestRestaurantName}`)
	log(`System started at: ${datetime.format(new Date(status.systemStartTime),'MMM DD YYYY, h:mm aa')}`)
}

