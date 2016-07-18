// Copyright 2015, University of Colorado Boulder

/**
 * Barometer node for x^2 deviation in 'Curve Fitting' simulation.
 * Linear dependence in [ 0; 1 ] interval,
 * Logarithmic dependence in ( 1; 100 ] interval.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
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

  // arrays that necessary for calculating chi value bounds while getting barometer color
  var lowerLimitArray = [ 0.004, 0.052, 0.118, 0.178, 0.23, 0.273, 0.31, 0.342, 0.369, 0.394, 0.545, 0.695, 0.779, 0.927 ];
  var upperLimitArr = [ 3.8, 3, 2.6, 2.37, 2.21, 2.1, 2.01, 1.94, 1.88, 1.83, 1.57, 1.35, 1.24, 1.07 ];

  /**
   * Convert chi values into barometer color depend on number of points.
   * This algorithm was copied directly from flash simulation.
   *
   * @param {number} chiValue - Chi value.
   * @param {number} numberOfPoints - Number of points that have been taken to plot curve.
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
      lowerBound = lowerLimitArray[ numberOfPoints - 1 ];
      upperBound = upperLimitArr[ numberOfPoints - 1 ];
    }
    else if ( numberOfPoints >= 11 || numberOfPoints < 20 ) {
      lowerBound = ( lowerLimitArray[ 9 ] + lowerLimitArray[ 10 ] ) / 2;
      upperBound = ( upperLimitArr[ 9 ] + upperLimitArr[ 10 ] ) / 2;
    }
    else if ( numberOfPoints >= 20 || numberOfPoints < 50 ) {
      lowerBound = ( lowerLimitArray[ 10 ] + lowerLimitArray[ 11 ] ) / 2;
      upperBound = ( upperLimitArr[ 10 ] + upperLimitArr[ 11 ] ) / 2;
    }
    else if ( numberOfPoints >= 50 ) {
      lowerBound = lowerLimitArray[ 12 ];
      upperBound = upperLimitArr[ 12 ];
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
   * Convert X^2 value to corresponded y position.
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

  /**
   * @param {Property.<number>} chiSquareProperty - Property that represents x-deviation.
   * @param {ObservableArray.<Point>} points - Array of points for plotting curve.
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function BarometerX2Node( chiSquareProperty, points, options ) {
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

    var updateChiFill = function() {
      valueRectNode.setFill( getChiFillFromChiValue( chiSquareProperty.value, points.length ) );
    };

    chiSquareProperty.link( function( chiSquare ) {
      valueRectNode.setRectHeight( valueToYPosition( chiSquare ) );
      updateChiFill();
    } );

    points.addListeners( updateChiFill, updateChiFill );
  }

  curveFitting.register( 'BarometerX2Node', BarometerX2Node );

  return inherit( VBox, BarometerX2Node, {
    /**
     * Add single tick.
     *
     * @param {number} value for which necessary draw tick.
     */
    addTick: function( value ) {
      var y = valueToYPosition( value );
      var tickWidth;

      // add label
      var label = new Text( value.toString(), { font: TICK_FONT, centerY: -y } );
      label.centerX = -label.width / 2 - 3;
      this._content.addChild( label );

      // add tick
      if ( value === 0 ) {
        tickWidth = CurveFittingConstants.BAROMETER_TICK_WIDTH;
      }
      else {
        tickWidth = CurveFittingConstants.BAROMETER_TICK_WIDTH / 2;
      }
      this._content.addChild( new Line( -0.5, -y, tickWidth, -y, LINE_OPTIONS ) );
    },

    /**
     * Add array of ticks.
     *
     * @param {Array.<number>} arrayOfTicks - Array of number for which necessary draw tick.
     */
    addTicks: function( arrayOfTicks ) {
      var self = this;
      arrayOfTicks.forEach( function( tickValue ) {
        self.addTick( tickValue );
      } );
    }
  } );
} );