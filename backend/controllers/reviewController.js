import pool from '../config/database.js';

// Create a review for a meal
export const createReview = async (req, res) => {
  console.log('Create review request received:', req.body);
  const connection = await pool.getConnection();

  try {
    const { meal_ref, stars, user_comment } = req.body;

    // Validation
    if (!meal_ref || stars === undefined) {
      return res.json({
        error: 'Meal reference and stars are required'
      }, 400);
    }

    // Validate stars: must be integer between 0 and 5
    if (!Number.isInteger(stars) || stars < 0 || stars > 5) {
      return res.json({
        error: 'Stars must be an integer between 0 and 5'
      }, 400);
    }

    // Check if user is authenticated as customer
    if (!req.user || req.user.role !== 'customer') {
      return res.json({
        error: 'Only customers can create reviews'
      }, 403);
    }

    const customerId = req.user.customerId;

    await connection.beginTransaction();

    // Check if meal exists
    const [meals] = await connection.query(
      'SELECT meal_id FROM MEAL WHERE meal_id = ?',
      [meal_ref]
    );

    if (meals.length === 0) {
      await connection.rollback();
      return res.json({ error: 'Meal not found' }, 404);
    }

    // Check if customer exists
    const [customers] = await connection.query(
      'SELECT customer_id FROM CUSTOMER WHERE customer_id = ?',
      [customerId]
    );

    if (customers.length === 0) {
      await connection.rollback();
      return res.json({ error: 'Customer not found' }, 404);
    }

    // Check if review already exists for this customer and meal
    const [existingReviews] = await connection.query(
      'SELECT customer_ref FROM REVIEWS WHERE customer_ref = ? AND meal_ref = ?',
      [customerId, meal_ref]
    );

    if (existingReviews.length > 0) {
      await connection.rollback();
      return res.json({
        error: 'You have already reviewed this meal'
      }, 409);
    }

    // Insert the review
    await connection.query(
      'INSERT INTO REVIEWS (customer_ref, meal_ref, stars, user_comment) VALUES (?, ?, ?, ?)',
      [customerId, meal_ref, stars, user_comment || null]
    );

    await connection.commit();

    res.json({
      message: 'Review created successfully',
      review: {
        customer_ref: customerId,
        meal_ref,
        stars,
        user_comment: user_comment || null
      }
    }, 201);

  } catch (error) {
    await connection.rollback();
    console.error('Create review error:', error);
    res.json({ error: 'Failed to create review', details: error.message }, 500);
  } finally {
    connection.release();
  }
};