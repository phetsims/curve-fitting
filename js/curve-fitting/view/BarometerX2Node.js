// Copyright 2002-2014, University of Colorado Boulder

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
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // constants
  var FONT_SIZE = 12;
  var TICK_FONT = new PhetFont( FONT_SIZE );
  var OFFSET = FONT_SIZE / 2;
  var RANGE = new Range( 0, 100 );
  var MIN_VALUE = RANGE.min;
  var MAX_VALUE = 1 + Math.log( RANGE.max );
  var HEAD_HEIGHT = 12;
  var HEIGHT = CurveFittingConstants.BAROMETER_HEIGHT - HEAD_HEIGHT - OFFSET;
  var LINE_OPTIONS = {
    lineWidth: 1.5,
    stroke: 'black'
  };

  var lowerLimitArray = [ 0.004000, 0.052000, 0.118000, 0.178000, 0.230000, 0.273000, 0.310000, 0.342000, 0.369000, 0.394000, 0.545000, 0.695000, 0.779000, 0.927000 ];
  var upperLimitArr = [ 3.800000, 3, 2.600000, 2.370000, 2.210000, 2.100000, 2.010000, 1.940000, 1.880000, 1.830000, 1.570000, 1.350000, 1.240000, 1.070000 ];

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
   * @param {ObservableArray.<Point>} pointsProperty - Array of points for plotting curve.
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function BarometerX2Node( chiSquareProperty, pointsProperty, options ) {
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
      valueRectNode.setFill( getChiFillFromChiValue( chiSquareProperty.value, pointsProperty.length ) );
    };

    chiSquareProperty.link( function( chiSquare ) {
      valueRectNode.setRectHeight( valueToYPosition( chiSquare ) );
      updateChiFill();
    } );

    pointsProperty.addListeners( updateChiFill, updateChiFill );
  }

  return inherit( VBox, BarometerX2Node, {
    // add single tick
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

    // add array of tick
    addTicks: function( arrayOfTicks ) {
      var self = this;
      arrayOfTicks.forEach( function( tickValue ) {
        self.addTick( tickValue );
      } );
    }
  } );
} );