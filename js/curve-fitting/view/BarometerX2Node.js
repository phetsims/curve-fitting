// Copyright 2015-2017, University of Colorado Boulder

/**
 * Barometer for x^2 (chi square) deviation.
 * Linear dependence in [ 0; 1 ] interval,
 * Logarithmic dependence in ( 1; 100 ] interval.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // constants
  var FONT_SIZE = 12;
  var TICK_FONT = new PhetFont( FONT_SIZE );
  var OFFSET = FONT_SIZE / 2;
  var RANGE = new RangeWithValue( 0, 100 );
  var MIN_VALUE = RANGE.min;
  var MAX_VALUE = 1 + Math.log( RANGE.max );
  var HEAD_HEIGHT = 12;
  var HEIGHT = CurveFittingConstants.BAROMETER_HEIGHT - HEAD_HEIGHT - OFFSET;
  var LINE_OPTIONS = {
    lineWidth: 1.5,
    stroke: 'black'
  };

  // arrays necessary for calculating chi value bounds while getting barometer color
  var LOWER_LIMIT_ARRAY = [ 0.004, 0.052, 0.118, 0.178, 0.23, 0.273, 0.31, 0.342, 0.369, 0.394, 0.545, 0.695, 0.779, 0.927 ];
  var UPPER_LIMIT_ARRAY = [ 3.8, 3, 2.6, 2.37, 2.21, 2.1, 2.01, 1.94, 1.88, 1.83, 1.57, 1.35, 1.24, 1.07 ];
  /**
   * @param {Points} points
   * @param {Property.<number>} chiSquaredProperty - Property that represents x squared deviation.
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function BarometerX2Node( points, chiSquaredProperty, curveVisibleProperty,  options ) {
    var valueRectNode = new Rectangle( -2 * CurveFittingConstants.BAROMETER_TICK_WIDTH / 3 - 0.5, 0, 2 * CurveFittingConstants.BAROMETER_TICK_WIDTH / 3, 0, { fill: CurveFittingConstants.BLUE_COLOR } );
    valueRectNode.rotation = Math.PI;

    this._content = new Node( {
      children: [
        valueRectNode,
        new ArrowNode( 0, 0, 0, -HEIGHT - HEAD_HEIGHT * 1.5, {
          headHeight: HEAD_HEIGHT,
          headWidth: 8,
          tailWidth: 0.5
        } )
      ]
    } );

    VBox.call( this, _.extend( {
      children: [
        new VStrut( OFFSET ),
        this._content
      ]
    }, options ) );

    this.addTicks( [ 0, 0.5, 1, 2, 3, 10, 30, 100 ] );

    // no need to unlink, present for the lifetime of the sim
    chiSquaredProperty.link( function( chiSquared ) {
      valueRectNode.setRectHeight( valueToYPosition( chiSquared ) );
      valueRectNode.setFill( getChiFillFromChiValue( chiSquaredProperty.value, points.getNumberPointsOnGraph() ) );
    } );

    curveVisibleProperty.linkAttribute( valueRectNode, 'visible');
  }

  curveFitting.register( 'BarometerX2Node', BarometerX2Node );

  /**
   * Convert chi values into barometer color depending on number of points.
   * This algorithm was copied directly from Flash simulation.
   *
   * @param {number} chiValue - Chi value.
   * @param {number} numberOfPoints - Number of points on Graph.
   */
  function getChiFillFromChiValue( chiValue, numberOfPoints ) {

    var red;
    var green;
    var blue;
    var lowerBound;
    var upperBound;
    var step1;
    var step2;
    var step3;
    var step4;

    if ( numberOfPoints >= 1 && numberOfPoints < 11 ) {
      lowerBound = LOWER_LIMIT_ARRAY[ numberOfPoints - 1 ];
      upperBound = UPPER_LIMIT_ARRAY[ numberOfPoints - 1 ];
    }
    else if ( numberOfPoints >= 11 || numberOfPoints < 20 ) {
      lowerBound = ( LOWER_LIMIT_ARRAY[ 9 ] + LOWER_LIMIT_ARRAY[ 10 ] ) / 2;
      upperBound = ( UPPER_LIMIT_ARRAY[ 9 ] + UPPER_LIMIT_ARRAY[ 10 ] ) / 2;
    }
    else if ( numberOfPoints >= 20 || numberOfPoints < 50 ) {
      lowerBound = ( LOWER_LIMIT_ARRAY[ 10 ] + LOWER_LIMIT_ARRAY[ 11 ] ) / 2;
      upperBound = ( UPPER_LIMIT_ARRAY[ 10 ] + UPPER_LIMIT_ARRAY[ 11 ] ) / 2;
    }
    else if ( numberOfPoints >= 50 ) {
      lowerBound = LOWER_LIMIT_ARRAY[ 12 ];
      upperBound = UPPER_LIMIT_ARRAY[ 12 ];
    }

    step1 = ( 1 + upperBound ) / 2;
    step2 = ( lowerBound + 1 ) / 2;
    step3 = ( upperBound + step1 ) / 2;
    step4 = ( lowerBound + step2 ) / 2;

    if ( chiValue < lowerBound ) {
      red = 0;
      green = 0;
      blue = 255;
    }
    else if ( chiValue >= lowerBound && chiValue < step4 ) {
      red = 0;
      green = 255 * ( chiValue - lowerBound ) / ( step4 - lowerBound );
      blue = 255;
    }
    else if ( chiValue >= step4 && chiValue < step2 ) {
      blue = 255 * ( step2 - chiValue ) / ( step2 - step4 );
      green = 255;
      red = 0;
    }
    else if ( chiValue >= step2 && chiValue <= step1 ) {
      red = 0;
      green = 255;
      blue = 0;
    }
    else if ( chiValue > step1 && chiValue < step3 ) {
      red = 255 * ( chiValue - step1 ) / ( step3 - step1 );
      green = 255;
      blue = 0;
    }
    else if ( chiValue >= step3 && chiValue < upperBound ) {
      red = 255;
      green = 255 * ( upperBound - chiValue ) / ( upperBound - step3 );
      blue = 0;
    }
    else if ( chiValue >= upperBound ) {
      red = 255;
      green = 0;
      blue = 0;
    }

    return 'rgb(' + Math.round( red ) + ', ' + Math.round( green ) + ', ' + Math.round( blue ) + ')';
  }

  /**
   * Convert X^2 value to corresponding y coordinate.
   *
   * @param {number} value - Barometer's X^2 value.
   * @returns {number}
   */
  function valueToYPosition( value ) {
    if ( value <= 1 ) {
      // expression "0.5 + ( HEIGHT - 1 )" need to prevent bad graph view in corners
      return 0.5 + ( HEIGHT - 1 ) * ( MIN_VALUE + ( value - MIN_VALUE ) / ( MAX_VALUE - MIN_VALUE ));
    }
    else {
      return Math.min( HEIGHT, HEIGHT * ( MIN_VALUE + 1 + Math.log( value - MIN_VALUE )) / ( MAX_VALUE - MIN_VALUE ) );
    }
  }

  return inherit( VBox, BarometerX2Node, {

    /**
     * Adds a tick.
     *
     * @param {number} value
     */
    addTick: function( value ) {

      var y = valueToYPosition( value );

      // label
      var label = new Text( value.toString(), { font: TICK_FONT, centerY: -y } );
      label.centerX = -label.width / 2 - 3;
      this._content.addChild( label );

      // tick
      var tickWidth;
      if ( value === 0 ) {
        tickWidth = CurveFittingConstants.BAROMETER_TICK_WIDTH;
      }
      else {
        tickWidth = CurveFittingConstants.BAROMETER_TICK_WIDTH / 2;
      }
      this._content.addChild( new Line( -0.5, -y, tickWidth, -y, LINE_OPTIONS ) );
    },

    /**
     * Adds multiple ticks.
     *
     * @param {number[]} values
     */
    addTicks: function( values ) {
      var self = this;
      values.forEach( function( value ) {
        self.addTick( value );
      } );
    }
  } );
} );