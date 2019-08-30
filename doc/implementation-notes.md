# Implementation notes for "Curve Fitting" (curve-fitting)

## Model

The model of curve-fitting uses a series of AXON properties to update the curve. Each data point is represented in the model as `Point`. `Point` stores its position and error. Each data point is kept in the observable array Points that handles the coming and going of data points.
 
`Points` is used extensively in calculation of the regression coefficients. `Points` is responsible for filtering out irrelevant points.

`Curve` determines the coefficients of the polynomial in an array called coefficients. The slider parameters (for 'Adjustable Fit') can be passed as coefficients or calculated based on least squares regression (for 'Best Fit'). `Curve` calculates the r-squared and chi-squared deviations according to the weighted chi-squared regression. 

For 'Adjustable Fit', the standard r-squared value can be negative. For the purposes of this simulation, in cases of a negative r-squared, the r-squared value is shown to be zero. The classical chi-squared equation is equal to zero when the number of points is less than the number of degrees of freedom (i.e order of polynomial + 1), since a 'Best Fit' curve would go through all the data points in most circumstances. For the purpose of this simulation, in 'Adjustable Fit' mode, the chi-squared value is not assumed to be zero in such situations (See Curve.js for more details). 

`CurveShape` converts the polynomial of the curve into a series of small lines.

## View

`BucketNode` is responsible for handling the points coming out of the bucket.

Almost none of the nodes need to be disposed because they are instantiated a finite number of times and last for the duration of the sim. `PointNode` is the exception as it needs a dispose, and it gets disposed in `BucketNode`.
 
 This simulation includes query parameters in `CurveFittingQueryParameters` that are useful for debugging
 and should be shared with the QA team.
