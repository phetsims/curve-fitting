---

Description of the model used in "Curve Fitting"

This simulation contains models:
 - Bucket
 - Curve
 - Graph area
 
There are two possible modes of curve view:
 - Best
 - Adjustable
 
There are three possible best approximations:
 - Linear
 - Quadratic
 - Cubic
 
For points implemented special flag to check point is inside graph area (Point.isInsideGraph).
 
Best fit calculates using Fit Maker. Fit Maker was directly ported from Flash simulation for consistency.
 
Formulas for calculating deviations uses reduced chi-squared statistic (it was also directly ported from Flash simulation).
 For more information please see:
  https://en.wikipedia.org/wiki/Goodness_of_fit
  http://arxiv.org/pdf/1012.3754.pdf
  

---
