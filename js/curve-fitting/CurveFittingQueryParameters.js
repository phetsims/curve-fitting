// Copyright 2017-2019, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );

  const CurveFittingQueryParameters = window.QueryStringMachine.getAll( {

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