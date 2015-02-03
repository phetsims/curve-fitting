// Copyright 2002-2014, University of Colorado Boulder

/**
 * Bucket node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );

  // constants
  var ERROR_BAR_WIDTH = 10;
  var PIXELS_IN_TICK = 10;
  var LINE_COLOR = 'rgb( 19, 52, 248 )';
  var LINE_HEIGHT = 15;

  /**
   * @param {Object} options for graph node
   * @constructor
   */
  function PointNode( pointModel, options ) {
    Node.call( this, options );

    // add top error bar line
    var errorBarTop = new Line( -ERROR_BAR_WIDTH, -LINE_HEIGHT, ERROR_BAR_WIDTH, -LINE_HEIGHT, {
      stroke: LINE_COLOR,
      lineWidth: 2
    } );
    this.addChild( errorBarTop );

    // add central line
    var centralLine = new Line( 0, -LINE_HEIGHT, 0, LINE_HEIGHT, {
      stroke: 'rgb( 19, 52, 248 )',
      lineWidth: 1
    } );
    this.addChild( centralLine );

    // add point view
    this.addChild( new Circle( {
      fill: CurveFittingConstants.POINT_FILL,
      radius: CurveFittingConstants.POINT_RADIUS,
      stroke: CurveFittingConstants.POINT_STROKE,
      lineWidth: CurveFittingConstants.POINT_LINE_WIDTH
    } ) );

    // add bottom error bar line
    var errorBarBottom = new Line( -ERROR_BAR_WIDTH, LINE_HEIGHT, ERROR_BAR_WIDTH, LINE_HEIGHT, {
      stroke: LINE_COLOR,
      lineWidth: 2
    } );
    this.addChild( errorBarBottom );
  }

  return inherit( Node, PointNode );
} );