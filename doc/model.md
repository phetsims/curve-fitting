---

Description of the model used in "Curve Fitting"

The curve fitting simulation demonstrates the least squares curve fitting approach
to polynomial curves. By grabbing data points from a bucket, the user is invited to find the
best fit to the data point series. Each data point has an the error attached to it. The user can manipulate the error (uncertainty) of each data point by changing the position of the error bars. The simulation allows for the curve fitting of three types of polynomials: 
Linear, Quadratic and Cubic. The fit can be done manually ('Adjustable Fit') by manipulating a sets of sliders 
or be determined automatically ('Best Fit'). The coefficients of the polynomial can be displayed by clicking on the equation accordion box.
The chi-squared and r-squared values are determined for each curve fit and displayed with a barometer style scale. 
The Best Fit coefficients are calculated using the standard procedure of weighted least square regression where one finds
the most appropriate polynomial coefficients that minimize the chi-squared value. The chi squared
is estimated as the sum of the squares deviation between the observed point and the functional portion of the model. Each data point in the sum is weighted with a term that is inversely proportional to the square of its uncertainty.
The r-squared value is calculated as one minus the ratio of weighted explained sum of squares over the weighted residual sum of squares.
                        
Formulas for calculating deviations uses reduced chi-squared statistic.
 For more information please see:
  https://en.wikipedia.org/wiki/Goodness_of_fit
  http://arxiv.org/pdf/1012.3754.pdf
  

---
