// Copyright 2019, University of Colorado Boulder

/**
 * An enumeration of valid ways to fit a curve to a set of points
 * BEST means that the best fit is found
 * ADJUSTABLE means that a user is controlling the fit of the curve
 *
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  const FitType = new Enumeration( [ 'ADJUSTABLE', 'BEST' ] );

  return curveFitting.register( 'FitType', FitType );
} );
