// Copyright 2015-2016, University of Colorado Boulder

/**
 * Model of the shape of a polynomial curve.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Function} getYValueAt - get the Y value at the x coordinate
   * @param {number} order - order of the polynomial that describes the curve
   * @param {Object} [options]
   * @constructor
   */
  function CurveShape( getYValueAt, order, options ) {

    options = _.extend( {
      debug: false
    }, options );

    Shape.call( this );

    // @private
    this.getYValueAt = getYValueAt;

    // model bounds of the graph area
    var graphBounds = CurveFittingConstants.GRAPH_MODEL_BOUNDS;

    // convenience variables
    var xMin = graphBounds.minX; // minimum value of the x range
    var xMax = graphBounds.maxX; // maximum value of the x range

    var i = 0;
    var xStart;
    var xEnd;

    if ( !options.debug ) {
      // curve is a line, quadratic or cubic depending on the order of the fit.
      switch( order ) {
        case 3: //cubic
          var cubicSteps = 1;
          var cubicInterval = (xMax - xMin) / cubicSteps;
          for ( i = 0; i < cubicSteps; i++ ) {
            xStart = xMin + i * cubicInterval;
            xEnd = xStart + cubicInterval;
            this.addCubic( xStart, xEnd );
          }
          break;
        case 2 : // quadratic
          var quadraticSteps = 1;
          var quadraticInterval = (xMax - xMin) / quadraticSteps;
          for ( i = 0; i < quadraticSteps; i++ ) {
            xStart = xMin + i * quadraticInterval;
            xEnd = xStart + quadraticInterval;
            this.addQuadratic( xStart, xEnd );
          }
          break;
        default: // linear
          this.addLinear( xMin, xMax );
          break;
      } // end of switch statement
    }
    else {
      this.shape = {};
      var steps = 1000;
      var interval = (xMax - xMin) / steps;
      var l = 0;
      var xValue;
      this.moveTo( xMin, getYValueAt( xMin ) );
      for ( l; l < steps; l++ ) {
        xValue = xMin + l * interval;
        this.lineTo( xValue, getYValueAt( xValue ) );
      }
    }
  }

  curveFitting.register( 'CurveShape', CurveShape );

  return inherit( Shape, CurveShape, {
    /**
     * gets the shape of the curve
     * @returns {Shape}
     * @public (read-only)
     */
    getShape: function() {
      return this;
    },
    /**
     * adds a linear segment shape between x position start and x position end
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     * @private
     */
    addLinear: function( start, end ) {

      var yStart = this.getYValueAt( start );
      var yEnd = this.getYValueAt( end );
      this.moveTo( start, yStart ).lineTo( end, yEnd );
      return this;  // for chaining
    },
    /**
     * adds a quadratic segment shape between x position start and x position end
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     * @private
     */
    addQuadratic: function( start, end ) {

      var cpx = (start + end) / 2; // point halfway between start and end

      var yAtStart = this.getYValueAt( start );
      var yAtEnd = this.getYValueAt( end );
      var yAtCpx = this.getYValueAt( cpx );

      // the control points cpy is not the value of yAtCpx but is related to it by the equation
      var cpy = (-yAtStart + 4 * yAtCpx - yAtEnd) / 2;

      this.moveTo( start, yAtStart ).quadraticCurveTo( cpx, cpy, end, yAtEnd );
      return this;  // for chaining
    },
    /**
     * adds a cubic segment shape between x position start and x position end
     * @param {number} start
     * @param {number} end
     * @returns {Shape}
     * @private
     */
    addCubic: function( start, end ) {

      var cp1x = (2 * start + end) / 3; // one third of the way between start and end
      var cp2x = (start + 2 * end) / 3; // two third of the way between start and end

      var yAtStart = this.getYValueAt( start );
      var yAtEnd = this.getYValueAt( end );
      var yAtCp1x = this.getYValueAt( cp1x );
      var yAtCp2x = this.getYValueAt( cp2x );

      // the control points cp1y and cp2y are not given by the values at yAtCp1x and yAtCp2x, but are related tp them through the equations
      var cp1y = (-5 * yAtStart + 18 * yAtCp1x - 9 * yAtCp2x + 2 * yAtEnd) / 6;
      var cp2y = (+2 * yAtStart - 9 * yAtCp1x + 18 * yAtCp2x - 5 * yAtEnd) / 6;

      this.moveTo( start, yAtStart ).cubicCurveTo( cp1x, cp1y, cp2x, cp2y, end, yAtEnd );
      return this; // for chaining
    }
  } );
} );