-- country name with most population from table country
SELECT Name FROM world.country 
WHERE Population = (SELECT MAX(Population) FROM country WHERE Population > 0);

-- the second one country with most population from table country
SELECT Name FROM world.country 
WHERE Population > 0
ORDER BY Population DESC 
LIMIT 1 OFFSET 1;

-- country name with lowest population from table country
SELECT Name FROM world.country 
WHERE Population = (SELECT MIN(Population) FROM country WHERE Population > 0);


-- the third one country with lowest population from table country
SELECT name FROM country 
WHERE Population > 0
ORDER BY Population ASC 
LIMIT 1 OFFSET 2;

-- the largest continent by sum surface area with life expectancy more than 75
SELECT Continent FROM country
WHERE LifeExpectancy > 75
GROUP BY Continent
ORDER BY SUM(SurfaceArea) DESC
LIMIT 1;
