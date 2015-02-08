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
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  // constants
  var ERROR_BAR_WIDTH = 10;
  var LINE_HEIGHT = 15;

  /**
   * @param {PropertySet} pointModel - Model for single point.
   * @param {ObservableArray} curveModelPoints - Array of points for plotting curve.
   * @param {Node} parentNode - Parent node of point
   * @param {Node} graphAreaNode - Node of graph area.
   * @param {Object} options for graph node.
   * @constructor
   */
  function PointNode( pointModel, curveModelPoints, parentNode, graphAreaNode, options ) {
    var self = this;
    Node.call( this, options );

    // add top error bar line
    var errorBarTop = new Line( -ERROR_BAR_WIDTH, -LINE_HEIGHT, ERROR_BAR_WIDTH, -LINE_HEIGHT, {
      stroke: CurveFittingConstants.BLUE_COLOR,
      lineWidth: 2
    } );
    this.addChild( errorBarTop );
    errorBarTop.addInputListener( new SimpleDragHandler( {} ) );

    // add central line
    var centralLine = new Line( 0, -LINE_HEIGHT, 0, LINE_HEIGHT, {
      stroke: CurveFittingConstants.BLUE_COLOR,
      lineWidth: 1
    } );
    this.addChild( centralLine );

    // add point view
    var circleView = new Circle( {
      fill: CurveFittingConstants.POINT_FILL,
      radius: CurveFittingConstants.POINT_RADIUS,
      stroke: CurveFittingConstants.POINT_STROKE,
      lineWidth: CurveFittingConstants.POINT_LINE_WIDTH
    } );
    this.addChild( circleView );

    // add drag handler
    var isUserControlled = false;
    circleView.addInputListener( new SimpleDragHandler( {
      start: function() {
        isUserControlled = true;
      },
      drag: function( e ) {
        if ( isUserControlled ) {
          pointModel.moveTo( e.pointer.point );
          graphAreaNode.setValues( pointModel );
        }
      },
      end: function() {
        if ( !graphAreaNode.checkDropPointAndSetValues( pointModel ) ) {
          curveModelPoints.remove( pointModel );
          self.getParent().removeChild( self );
        }
        isUserControlled = false;
      }
    } ) );

    // add bottom error bar line
    var errorBarBottom = new Line( -ERROR_BAR_WIDTH, LINE_HEIGHT, ERROR_BAR_WIDTH, LINE_HEIGHT, {
      stroke: CurveFittingConstants.BLUE_COLOR,
      lineWidth: 2
    } );
    this.addChild( errorBarBottom );

    // add observers
    pointModel.positionProperty.link( function( position ) {
      self.setTranslation( parentNode.globalToLocalPoint( position ) );
    } );
  }

  return inherit( Node, PointNode );
} );