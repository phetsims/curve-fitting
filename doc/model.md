# Description of the model used in "Curve Fitting"

The curve fitting simulation demonstrates the least squares curve fitting approach
to polynomial curves. By dragging data points from a bucket to a graph, the user is invited to find the curve of
best fit for the data points on the graph. Each data point has an error (uncertainty) attached to it. The user can manipulate the error of each data point by changing the position of the error bars. 

The simulation allows fitting 3 types of polynomial curves: 
Linear, Quadratic and Cubic. The fit can be done manually ('Adjustable Fit') by manipulating a sets of sliders 
or be determined automatically ('Best Fit'). 

The chi-squared and r-squared values are determined for the curve in relation to the data points and are displayed with a barometer-style scale. 
The Best Fit coefficients are calculated using the standard procedure of weighted least square regression where one finds
the most appropriate polynomial coefficients that minimize the chi-squared value.

The chi-squared value
is estimated as the sum of the squared deviation between the observed point's value and the curve's corresponding value. 
Each data point in the sum is weighted with a term that is inversely proportional to the square of its uncertainty.
The r-squared value is calculated as one minus the ratio of weighted explained sum of squares over the weighted residual sum of squares.

The formulas for calculating deviations use the reduced chi-squared statistic. For more information please see:
* https://en.wikipedia.org/wiki/Goodness_of_fit
* http://arxiv.org/pdf/1012.3754.pdf
