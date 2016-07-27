// Copyright 2015-2016, University of Colorado Boulder

/**
 * The methods of fitting a curve to data points.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );

  var Fit = Object.freeze( {
    BEST: 'best',
    ADJUSTABLE: 'adjustable'
  } );

  curveFitting.register( 'Fit', Fit );

  return Fit;
} );