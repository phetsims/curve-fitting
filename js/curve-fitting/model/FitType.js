// Copyright 2015-2016, University of Colorado Boulder

/**
 * Fit types in the 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );

  var FitType = Object.freeze( {
    BEST: 'best',
    ADJUSTABLE: 'adjustable'
  } );

  curveFitting.register( 'FitType', FitType );

  return FitType;
} );