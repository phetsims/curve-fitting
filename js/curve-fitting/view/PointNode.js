// Copyright 2002-2014, University of Colorado Boulder

/**
 * Single point node in 'Curve Fitting' simulation.
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
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // strings
  var pattern_0valueX_1valueY = require( 'string!CURVE_FITTING/pattern.0valueX.1valueY' );
  var pattern_delta_0valueDelta = require( 'string!CURVE_FITTING/pattern.delta.0valueDelta' );

  // constants
  var CENTRAL_LINE_OPTIONS = {
    stroke: CurveFittingConstants.BLUE_COLOR,
    lineWidth: 1
  };
  var DILATION_SIZE = 4;
  var ERROR_BAR_WIDTH = 20;
  var ERROR_BAR_HEIGHT = 2;
  var ERROR_BAR_OPTIONS = {
    fill: CurveFittingConstants.BLUE_COLOR
  };
  var FONT = new PhetFont( 11 );

  /**
   * @param {PropertySet} pointModel - Model for single point.
   * @param {ObservableArray} curveModelPoints - Array of points for plotting curve.
   * @param {Property.<boolean>} isValuesVisibleProperty - Property to control visibility of values.
   * @param {Property.<boolean>} isResidualsVisibleProperty - Property to track residuals visibility.
   * @param {Node} parentNode - Parent node of point
   * @param {Node} graphAreaNode - Node of graph area.
   * @param {Object} options for graph node.
   * @constructor
   */
  function PointNode( pointModel, curveModelPoints, isValuesVisibleProperty, isResidualsVisibleProperty, parentNode, graphAreaNode, options ) {
    var self = this;

    Node.call( this, options );

    // create common drag and drop functions for top and bottom error bars
    var clickYOffset;
    var deltaInitial;
    var isUserControlledDelta = false;
    var deltaStartDragHandler = function( e ) {
      isUserControlledDelta = true;
      clickYOffset = self.globalToParentPoint( e.pointer.point ).y - e.currentTarget.y;
      deltaInitial = pointModel.delta;
    };
    var deltaEndDragHandler = function() {
      isUserControlledDelta = false;
    };

    // add top error bar line
    var errorBarTop = new Rectangle( -ERROR_BAR_WIDTH / 2, 0, ERROR_BAR_WIDTH, ERROR_BAR_HEIGHT, ERROR_BAR_OPTIONS );
    this.addChild( errorBarTop );
    errorBarTop.addInputListener( new SimpleDragHandler( {
      start: deltaStartDragHandler,
      drag: function( e ) {
        if ( isUserControlledDelta ) {
          var y = self.globalToParentPoint( e.pointer.point ).y - clickYOffset;
          pointModel.delta = Math.max( 0.1, deltaInitial - y / CurveFittingConstants.PIXELS_IN_TICK );
        }
      },
      end: deltaEndDragHandler
    } ) );

    // add bottom error bar line
    var errorBarBottom = new Rectangle( -ERROR_BAR_WIDTH / 2, 0, ERROR_BAR_WIDTH, ERROR_BAR_HEIGHT, ERROR_BAR_OPTIONS );
    this.addChild( errorBarBottom );
    errorBarBottom.addInputListener( new SimpleDragHandler( {
      start: deltaStartDragHandler,
      drag: function( e ) {
        if ( isUserControlledDelta ) {
          var y = self.globalToParentPoint( e.pointer.point ).y - clickYOffset;
          pointModel.delta = Math.max( 0.1, deltaInitial + y / CurveFittingConstants.PIXELS_IN_TICK );
        }
      },
      end: deltaEndDragHandler
    } ) );

    // add central line
    var centralLine = new Line( 0, 0, 0, 0, CENTRAL_LINE_OPTIONS );
    this.addChild( centralLine );

    // add point view
    var circleView = new Circle( {
      fill: CurveFittingConstants.POINT_FILL,
      radius: CurveFittingConstants.POINT_RADIUS,
      stroke: CurveFittingConstants.POINT_STROKE,
      lineWidth: CurveFittingConstants.POINT_LINE_WIDTH
    } );
    this.addChild( circleView );

    // add drag handler for point
    var isUserControlledPoint = false;
    circleView.addInputListener( new SimpleDragHandler( {
      start: function() {
        isUserControlledPoint = true;
      },
      drag: function( e ) {
        if ( isUserControlledPoint ) {
          pointModel.moveTo( e.pointer.point );
          graphAreaNode.setValues( pointModel );
        }
      },
      end: function() {
        if ( !graphAreaNode.checkDropPointAndSetValues( pointModel ) ) {
          curveModelPoints.remove( pointModel );
        }

        isUserControlledPoint = false;
      }
    } ) );

    // add value text label
    var valueTextLabel = new Text( StringUtils.format( pattern_0valueX_1valueY, Util.toFixed( pointModel.x, 1 ), Util.toFixed( pointModel.y, 1 ) ), {
      font: FONT,
      x: circleView.localBounds.maxX + 2,
      centerY: circleView.centerY
    } );
    this.addChild( valueTextLabel );

    var deltaTextLabel = new SubSupText( StringUtils.format( pattern_delta_0valueDelta, Util.toFixed( pointModel.delta, 1 ) ), {
      font: FONT,
      x: errorBarTop.localBounds.maxX + 2,
      centerY: errorBarTop.centerY
    } );
    this.addChild( deltaTextLabel );

    // add observers
    pointModel.positionProperty.link( function( position ) {
      self.setTranslation( parentNode.globalToLocalPoint( position ) );
    } );

    pointModel.deltaProperty.link( function( delta ) {
      var lineHeight = CurveFittingConstants.PIXELS_IN_TICK * delta;

      // update top error bar
      errorBarTop.setRectY( -lineHeight - ERROR_BAR_HEIGHT / 2 );
      errorBarTop.touchArea = errorBarTop.localBounds.dilatedXY( DILATION_SIZE, DILATION_SIZE );
      errorBarTop.mouseArea = errorBarTop.localBounds.dilatedXY( DILATION_SIZE, DILATION_SIZE );
      deltaTextLabel.centerY = -lineHeight;

      // update central line
      centralLine.setY1( -lineHeight );
      centralLine.setY2( lineHeight );

      // update bottom error bar
      errorBarBottom.setRectY( lineHeight - ERROR_BAR_HEIGHT / 2 );
      errorBarBottom.touchArea = errorBarBottom.localBounds.dilatedXY( DILATION_SIZE, DILATION_SIZE );
      errorBarBottom.mouseArea = errorBarBottom.localBounds.dilatedXY( DILATION_SIZE, DILATION_SIZE );
    } );

    var updateValueText = function() {
      if ( valueTextLabel.visible ) {
        valueTextLabel.setText( StringUtils.format( pattern_0valueX_1valueY, Util.toFixed( pointModel.x, 1 ), Util.toFixed( pointModel.y, 1 ) ) );
      }
    };
    isValuesVisibleProperty.linkAttribute( valueTextLabel, 'visible' );
    isValuesVisibleProperty.onValue( true, updateValueText );
    pointModel.positionProperty.lazyLink( updateValueText );

    var updateDeltaText = function() {
      if ( deltaTextLabel.visible ) {
        deltaTextLabel.setText( StringUtils.format( pattern_delta_0valueDelta, Util.toFixed( pointModel.delta, 1 ) ) );
      }
    };
    isValuesVisibleProperty.onValue( true, updateDeltaText );
    isValuesVisibleProperty.linkAttribute( deltaTextLabel, 'visible' );
    pointModel.deltaProperty.lazyLink( updateDeltaText );

    // change appearance when residuals active
    isResidualsVisibleProperty.link( function( isResidualsVisible ) {
      if ( isResidualsVisible ) {
        centralLine.visible = false;
        errorBarTop.setFill( CurveFittingConstants.LIGHT_GRAY_COLOR );
        errorBarBottom.setFill( CurveFittingConstants.LIGHT_GRAY_COLOR );
      }
      else {
        centralLine.visible = true;
        errorBarTop.setFill( CurveFittingConstants.BLUE_COLOR );
        errorBarBottom.setFill( CurveFittingConstants.BLUE_COLOR );
      }
    } );
  }

  return inherit( Node, PointNode );
} );