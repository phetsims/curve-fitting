// Copyright 2017, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );

  var CurveFittingQueryParameters = window.QueryStringMachine.getAll( {

    //TODO document
    snapToGrid: {
      type: 'boolean',
      defaultValue: false
    },

    //TODO document
    animatedPoints: {
      type: 'boolean',
      defaultValue: false
    },

    //TODO document
    debugLine: {
      type: 'boolean',
      defaultValue: false
    }
  } );

  curveFitting.register( 'CurveFittingQueryParameters', CurveFittingQueryParameters );

  return CurveFittingQueryParameters;
} );