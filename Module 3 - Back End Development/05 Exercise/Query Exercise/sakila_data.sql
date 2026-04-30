-- Show all data using IN, and display the country_id and country columns of the following countries: China, Bangladesh, and India
SELECT country_id, country FROM sakila.country 
WHERE country IN ('China', 'Bangladesh', 'India');

-- Find every actors whose last names contain the letters OD. Order the rows by last name and first name, in that order
SELECT first_name, last_name FROM sakila.actor 
WHERE last_name LIKE '%OD%'
ORDER BY last_name, first_name;

-- Modify table actors. Add a middle_name column to the table actor. Position it between first_name and last_name. Hint: you will need to specify the data type.
ALTER TABLE sakila.actor 
ADD COLUMN middle_name VARCHAR(45) 
AFTER first_name;

-- List every last names of actors and the number of actors who have that last name, but only for names that are shared by at least two actors
SELECT last_name, COUNT(*) as actor_count FROM sakila.actor
GROUP BY last_name
HAVING COUNT(*) >= 2
ORDER BY actor_count DESC;

-- Join the table and display the first and last names, as well as the address, of each staff member.
SELECT a.first_name, a.last_name, b.address
FROM sakila.staff a
JOIN sakila.address b ON a.address_id = b.address_id;

-- Find out how many copies of the film “Hunchback Impossible” exist in the inventory system
SELECT COUNT(*) as copy_count FROM sakila.inventory a
JOIN sakila.film b ON a.film_id = b.film_id
WHERE b.title = 'Hunchback Impossible';

-- Find and display the most frequently rented movies in descending order.
SELECT f.title, COUNT(r.rental_id) as rental_count
FROM sakila.film f
JOIN sakila.inventory i ON f.film_id = i.film_id
JOIN sakila.rental r ON i.inventory_id = r.inventory_id
GROUP BY f.film_id, f.title
ORDER BY rental_count DESC;

-- Write down a query in order to display each store its store ID, city, and country
SELECT s.store_id, ci.city, co.country
FROM sakila.store s
JOIN sakila.address a ON s.address_id = a.address_id
JOIN sakila.city ci ON a.city_id = ci.city_id
JOIN sakila.country co ON ci.country_id = co.country_id;

-- Use subqueries to display every actors who appear in the film Alone Trip.
SELECT a.first_name, a.last_name
FROM sakila.actor a
WHERE a.actor_id IN (
    SELECT fa.actor_id 
    FROM sakila.film_actor fa
    JOIN sakila.film f ON fa.film_id = f.film_id
    WHERE f.title = 'Alone Trip'
);

-- Delete the middle_name column from table actors
ALTER TABLE sakila.actor 
DROP COLUMN middle_name;