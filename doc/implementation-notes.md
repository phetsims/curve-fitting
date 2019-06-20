Implementation notes for "Curve Fitting" (curve-fitting)

The model of curve-fitting uses a series of AXON properties to update the curve. Each data point is represented in the model as Point. The Point carries information about their position,
 and errors. Each data point is kept in the observable array Points that handles the coming and going of data points.
 Points is used extensively in calculation of the regression coefficients. Points is responsible for filtering out points that are not 
on the graph area. The Curve model determines the coefficients of the polynomial is an array called 
coefficients. The slider parameters (for 'Adjustable Fit') can be passed as coefficients or calculated based 
on least squares regression (for 'Best Fit'). Curve calculates the r-squared and chi-squared deviations according to the weighted chi-squared regression.
For adjustable fit, the standard r-squared value can be negative. For the purpose of this simulation, in those case the r-squared value is shown to be zero.
The classical chi-squared equation is equal to zero when the number of points is less than the number of degrees of freedom i.e order of polynomial +1, since a best Fit curve
would always go through all the data points in these circumstances. For the purpose of this simulation, in 'Adjustable Fit' mode, the chi-squared value is not assumed to
 be zero in such situations (See Curve.js for more details). The model CurveShape converts the polynomial of the curve into a series of small lines.
 In the view, BucketNode is responsible for the initial handling of the points out of the bucket.
 This simulation includes query parameters in CurveFittingQueryParameters that are useful for debugging
 and should be shared with the QA team. 
  


