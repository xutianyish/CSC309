/* 
 * This code is provided solely for the personal and private use of students 
 * taking the CSC309H course at the University of Toronto. Copying for purposes 
 * other than this use is expressly prohibited. All forms of distribution of 
 * this code, including but not limited to public repositories on GitHub, 
 * GitLab, Bitbucket, or any other online platform, whether as given or with 
 * any changes, are expressly prohibited. 
*/  

/* E4 server.js */
'use strict';
const log = console.log;

// Express
const express = require('express')
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());

// Mongo and Mongoose
const { ObjectID } = require('mongodb')
const { mongoose } = require('./db/mongoose');
const { Restaurant } = require('./models/restaurant')

// helper function
function isMongoError(error) { // checks for first error returned by promise rejection if Mongo database suddently disconnects
	return typeof error === 'object' && error !== null && error.name === "MongoNetworkError"
}

/* 
   Restaurant API routes below. 
   Note: You may use async-await if you wish, but you will have to modify the functions as needed.
*/

/// Route for adding restaurant, with *no* reservations (an empty array).
/* 
Request body expects:
{
	"name": <restaurant name>
	"description": <restaurant description>
}
Returned JSON should be the database document added.
*/
// POST /restaurants
app.post('/restaurants', async(req, res) => {
	// Add code here
	if(mongoose.connection.readyState != 1){
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return;
	}

	// create a new restaurant using the Restaurant mongoose model
	const restaurant = new Restaurant({
		name: req.body.name,
		description: req.body.description
	})

	// save restaurant to database
	try{
		const result = await restaurant.save()
		res.send(result)
	} catch(error) {
		if(isMongoError(error)){
			res.status(500).send('Internal server error')
		} else {
			res.status(400).send('Bad Request')
		}
	}
})


/// Route for getting all restaurant information.
// GET /restaurants
app.get('/restaurants', async(req, res) => {
	// Add code here
	if(mongoose.connection.readyState != 1){
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return;
	}

	// get the restaurants
	try{
		const restaurants = await Restaurant.find()
		res.send( restaurants )
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error')
	}
})


/// Route for getting information for one restaurant.
// GET /restaurants/id
app.get('/restaurants/:id', async(req, res) => {
	// Add code here
	const id = req.params.id

	// Validate id immediately
	if(!ObjectID.isValid(id)){
		res.status(404).send('Restaurant not found')
		return;
	}

	// check mongoose connection established
	if(mongoose.connection.readyState != 1){
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return;
	}

	// if id is valid, findById
	try{
		const restaurant = await Restaurant.findById(id)
		if(!restaurant){
			res.status(404).send('Restaurant not found') // could not find this restaurant
		} else {
			res.send(restaurant)
		}
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error')
	}
})


/// Route for adding reservation to a particular restaurant.
/* 
Request body expects:
{
	"time": <time>
	"people": <number of people>
}
*/
// Returned JSON should have the updated restaurant database 
//   document that the reservation was added to, AND the reservation subdocument:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// POST /restaurants/id
app.post('/restaurants/:id', async(req, res) => {
	// Add code here
	if(mongoose.connection.readyState != 1){
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return;
	}

	// create a new resrvation using the Restaurant mongoose model
	const reservation = {
		time: req.body.time,
		people: req.body.people
	}

	const id = req.params.id

	if(!ObjectID.isValid(id)){
		res.status(404).send()
		return;
	}

	try{
		const restaurant = await Restaurant.findById(id)
		if(!restaurant){
			res.status(404).send('Restaurant not found') // could not find this restaurant
		} else {
			restaurant.reservations.push(reservation)
			await restaurant.save()
			res.send({reservation: restaurant.reservations[restaurant.reservations.length-1], restaurant: restaurant})
		}
	} catch(error) {
		res.status(500).send('Internal Server Error')
	}
})


/// Route for getting information for one reservation of a restaurant (subdocument)
// GET /restaurants/id
app.get('/restaurants/:id/:resv_id', async(req, res) => {
	// Add code here
	const id = req.params.id
	const resv_id = req.params.resv_id

	// Validate id immediately
	if(!ObjectID.isValid(id) || !ObjectID.isValid(resv_id)){
		res.status(404).send('Restaurant or reservation not found')
		return;
	}

	// check mongoose connection established
	if(mongoose.connection.readyState != 1){
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return;
	}

	// if id and resv_id are valid, find restaurant by findById
	try{
		const restaurant = await Restaurant.findById(id)
		if(!restaurant){
			res.status(404).send('Restaurant not found') // could not find this restaurant
		} else {
			// restaurant is valid, find resveration by findById
			const reservation = await restaurant.reservations.id(resv_id)
			log(reservation)
			if(!reservation){
				res.status(404).send('Reservation not found') // could not find the reservation
			} else {
				res.send(reservation)
			}
		}
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error')
	}
})


/// Route for deleting reservation
// Returned JSON should have the updated restaurant database
//   document from which the reservation was deleted, AND the reservation subdocument deleted:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// DELETE restaurant/<restaurant_id>/<reservation_id>
app.delete('/restaurants/:id/:resv_id', async(req, res) => {
	// Add code here
	const id = req.params.id
	const resv_id = req.params.resv_id
	
	// Validate id
	if(!ObjectID.isValid(id) || !ObjectID.isValid(resv_id)){
		res.status(404).send('Resource not found')
		return;
	}

	// check mongoose connection established
	if(mongoose.connection.readyState != 1){
		log('Issue with mongoose connection')
		res.status(500).send('Internal Server Error')
		return;
	}

	// Delete a reservation by their id
	try {
		const restaurant = await Restaurant.findById(id)
		if(!restaurant){
			res.status(404).send('Restaurant not found')
		} else {
			const reservation = await restaurant.reservations.id(resv_id)
			if(!reservation){
				res.status(404).send('Reservation not found')
			} else{
				await restaurant.reservations.remove(resv_id)
				await restaurant.save()
				res.send({reservation: reservation, restaurant: restaurant})
			}
		}
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error: cannot delete')
	}
})


/// Route for changing reservation information
/* 
Request body expects:
{
	"time": <time>
	"people": <number of people>
}
*/
// Returned JSON should have the updated restaurant database
//   document in which the reservation was changed, AND the reservation subdocument changed:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// PATCH restaurant/<restaurant_id>/<reservation_id>
app.patch('/restaurants/:id/:resv_id', async(req, res) => {
	// Add code here
	const id = req.params.id
	const resv_id = req.params.resv_id
	
	// Validate id
	if(!ObjectID.isValid(id) || !ObjectID.isValid(resv_id)){
		res.status(404).send('Resource not found')
		return;
	}

	// check mongoose connection established
	if(mongoose.connection.readyState != 1){
		log('Issue with mongoose connection')
		res.status(500).send('Internal Server Error')
		return;
	}

	// Delete a reservation by their id
	try {
		const restaurant = await Restaurant.findById(id)
		if(!restaurant){
			res.status(404).send('Restaurant not found')
		} else {
			const reservation = await restaurant.reservations.id(resv_id)
			if(!reservation){
				res.status(404).send('Reservation not found')
			} else{
				reservation.time = req.body.time
				reservation.people = req.body.people
				await restaurant.save()
				res.send({reservation: reservation, restaurant: restaurant})
			}
		}
	} catch(error) {
		log(error)
		res.status(500).send('Internal Server Error: cannot delete')
	}
})


////////// DO NOT CHANGE THE CODE OR PORT NUMBER BELOW
const port = process.env.PORT || 5000
app.listen(port, () => {
	log(`Listening on port ${port}...`)
});
