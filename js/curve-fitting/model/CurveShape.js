// Copyright 2017-2019, University of Colorado Boulder

/**
 * Model of the shape of a polynomial curve.
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Shape = require( 'KITE/Shape' );

  class CurveShape extends Shape {

    /**
     * @param {Function} getYValueAt - a function that gets a Y value for the given X coordinate
     */
    constructor( getYValueAt ) {

      super();

      // model bounds of the graph area
      const graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

      // convenience variables
      const xMin = graphBounds.minX; // minimum value of the x range
      const xMax = graphBounds.maxX; // maximum value of the x range

      // how many segments: more segments means a finer/more accurate curve
      const steps = 220;

      // separation between adjacent x coordinates
      const interval = ( xMax - xMin ) / steps;

      // move shape to initial location
      this.moveTo( xMin, getYValueAt( xMin ) );

      // create lines connecting each point
      for ( let x = xMin + interval; x <= xMax; x += interval ) {
        const y = getYValueAt( x );
        this.lineTo( x, y );
      }

    }

    /**
     * gets the shape of the curve
     * @returns {Shape}
     * @public (read-only)
     */
    getShape() {
      return this;
    }

  }

  curveFitting.register( 'CurveShape', CurveShape );

  return CurveShape;
} );