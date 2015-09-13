// Copyright 2002-2014, University of Colorado Boulder

/**
 * Single point node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
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
  var BAR_COLOR = Color.toColor( CurveFittingConstants.BLUE_COLOR );
  var CENTRAL_LINE_OPTIONS = {
    stroke: CurveFittingConstants.BLUE_COLOR,
    lineWidth: 1
  };
  var DILATION_SIZE = 8;
  var ERROR_BAR_WIDTH = 20;
  var ERROR_BAR_HEIGHT = 2;
  var ERROR_BAR_OPTIONS = {
    fill: CurveFittingConstants.BLUE_COLOR
  };
  var FONT = new PhetFont( 11 );
  var HALO_ALPHA = 0.3;
  var HALO_RECT_OFFSET = 4;
  var POINT_COLOR = Color.toColor( CurveFittingConstants.POINT_FILL );

  /**
   * @param {PropertySet} pointModel - Model for single point.
   * @param {ObservableArray} curveModelPoints - Array of points for plotting curve.
   * @param {Property.<boolean>} areValuesVisibleProperty - Property to control visibility of values.
   * @param {Property.<boolean>} areResidualsVisibleProperty - Property to track residuals visibility.
   * @param {Node} parentNode - Parent node of point
   * @param {Node} graphAreaNode - Node of graph area.
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function PointNode( pointModel, curveModelPoints, areValuesVisibleProperty, areResidualsVisibleProperty, parentNode, graphAreaNode, options ) {
    var self = this;

    Node.call( this, _.extend( { cursor: 'pointer' }, options ) );

    // create common drag and drop vars and functions for top and bottom error bars
    var clickYOffset;
    var deltaInitial;
    var isUserControlledDeltaTop = false;
    var isUserControlledDeltaBottom = false;

    // top error bar line node
    var errorBarTopNode = new Rectangle( -ERROR_BAR_WIDTH / 2, 0, ERROR_BAR_WIDTH, ERROR_BAR_HEIGHT, ERROR_BAR_OPTIONS );
    errorBarTopNode.addInputListener( new SimpleDragHandler( {
      start: function( e ) {
        if ( !isUserControlledDeltaBottom ) {
          isUserControlledDeltaTop = true;
          clickYOffset = self.globalToParentPoint( e.pointer.point ).y - e.currentTarget.y;
          deltaInitial = pointModel.delta;
        }
      },
      drag: function( e ) {
        if ( isUserControlledDeltaTop ) {
          var y = self.globalToParentPoint( e.pointer.point ).y - clickYOffset;
          pointModel.delta = Math.max( 0.1, deltaInitial - y / graphAreaNode._graphScale );
        }
      },
      end: function() {
        isUserControlledDeltaTop = false;
      }
    } ) );

    // top error bar line halo node
    var haloErrorBarTopNode = new Rectangle( -( ERROR_BAR_WIDTH + HALO_RECT_OFFSET ) / 2, -HALO_RECT_OFFSET / 2,
      HALO_RECT_OFFSET + ERROR_BAR_WIDTH, HALO_RECT_OFFSET + ERROR_BAR_HEIGHT,
      { fill: BAR_COLOR.withAlpha( HALO_ALPHA ), pickable: false, visible: false } );

    // top error bar
    var errorBarTop = new Node( {
      children: [ errorBarTopNode, haloErrorBarTopNode ]
    } );
    this.addChild( errorBarTop );

    // add bottom error bar line node
    var errorBarBottomNode = new Rectangle( -ERROR_BAR_WIDTH / 2, 0, ERROR_BAR_WIDTH, ERROR_BAR_HEIGHT, ERROR_BAR_OPTIONS );
    errorBarBottomNode.addInputListener( new SimpleDragHandler( {
      start: function( e ) {
        if ( !isUserControlledDeltaTop ) {
          isUserControlledDeltaBottom = true;
          clickYOffset = self.globalToParentPoint( e.pointer.point ).y - e.currentTarget.y;
          deltaInitial = pointModel.delta;
        }
      },
      drag: function( e ) {
        if ( isUserControlledDeltaBottom ) {
          var y = self.globalToParentPoint( e.pointer.point ).y - clickYOffset;
          pointModel.delta = Math.max( 0.1, deltaInitial + y / graphAreaNode._graphScale );
        }
      },
      end: function() {
        isUserControlledDeltaBottom = false;
      }
    } ) );

    // bottom error bar line halo node
    var haloTopBarBottomNode = new Rectangle( -( ERROR_BAR_WIDTH + HALO_RECT_OFFSET ) / 2, -HALO_RECT_OFFSET / 2,
      HALO_RECT_OFFSET + ERROR_BAR_WIDTH, HALO_RECT_OFFSET + ERROR_BAR_HEIGHT,
      { fill: BAR_COLOR.withAlpha( HALO_ALPHA ), pickable: false, visible: false } );

    // bottom error bar
    var errorBarBottom = new Node( {
      children: [ errorBarBottomNode, haloTopBarBottomNode ]
    } );
    this.addChild( errorBarBottom );

    // add halo bar nodes handler
    var barHaloHandler = new ButtonListener( {
      up: function() {
        haloErrorBarTopNode.visible = false;
        haloTopBarBottomNode.visible = false;
      },
      down: function() {
        haloErrorBarTopNode.visible = true;
        haloTopBarBottomNode.visible = true;
      },
      over: function() {
        haloErrorBarTopNode.visible = true;
        haloTopBarBottomNode.visible = true;
      }
    } );
    errorBarBottomNode.addInputListener( barHaloHandler );
    errorBarTopNode.addInputListener( barHaloHandler );

    // add central line
    var centralLine = new Line( 0, 0, 0, 0, CENTRAL_LINE_OPTIONS );
    this.addChild( centralLine );

    // add point view
    var circleView = new Circle( {
      fill: POINT_COLOR,
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
      x: errorBarTopNode.localBounds.maxX + 2,
      centerY: errorBarTopNode.centerY
    } );
    this.addChild( deltaTextLabel );

    // add observers
    pointModel.positionProperty.link( function( position ) {
      self.setTranslation( parentNode.globalToLocalPoint( position ) );
    } );

    pointModel.deltaProperty.link( function( delta ) {
      var lineHeight = graphAreaNode._graphScale * delta;

      // update top error bar
      errorBarTop.setTranslation( 0, -lineHeight - ERROR_BAR_HEIGHT / 2 );
      errorBarTopNode.touchArea = errorBarTop.localBounds.dilatedXY( DILATION_SIZE, DILATION_SIZE );
      errorBarTopNode.mouseArea = errorBarTop.localBounds.dilatedXY( DILATION_SIZE, DILATION_SIZE );
      deltaTextLabel.centerY = -lineHeight;

      // update central line
      centralLine.setY1( -lineHeight );
      centralLine.setY2( lineHeight );

      // update bottom error bar
      errorBarBottom.setTranslation( 0, lineHeight - ERROR_BAR_HEIGHT / 2 );
      errorBarBottomNode.touchArea = errorBarBottom.localBounds.dilatedXY( DILATION_SIZE, DILATION_SIZE );
      errorBarBottomNode.mouseArea = errorBarBottom.localBounds.dilatedXY( DILATION_SIZE, DILATION_SIZE );
    } );

    var updateValueText = function() {
      if ( valueTextLabel.visible && !isNaN( pointModel.x ) && !isNaN( pointModel.y ) ) {
        valueTextLabel.setText( StringUtils.format( pattern_0valueX_1valueY, Util.toFixed( pointModel.x, 1 ), Util.toFixed( pointModel.y, 1 ) ) );
      }
      else {
        valueTextLabel.setText( '' );
      }
    };
    areValuesVisibleProperty.linkAttribute( valueTextLabel, 'visible' );
    areValuesVisibleProperty.onValue( true, updateValueText );
    pointModel.positionProperty.lazyLink( updateValueText );

    var updateDeltaText = function() {
      if ( deltaTextLabel.visible ) {
        deltaTextLabel.setText( StringUtils.format( pattern_delta_0valueDelta, Util.toFixed( pointModel.delta, 1 ) ) );
      }
    };
    areValuesVisibleProperty.onValue( true, updateDeltaText );
    areValuesVisibleProperty.linkAttribute( deltaTextLabel, 'visible' );
    pointModel.deltaProperty.lazyLink( updateDeltaText );

    // change appearance when residuals active
    areResidualsVisibleProperty.link( function( areResidualsVisible ) {
      if ( areResidualsVisible ) {
        centralLine.visible = false;
        errorBarTopNode.setFill( CurveFittingConstants.LIGHT_GRAY_COLOR );
        errorBarBottomNode.setFill( CurveFittingConstants.LIGHT_GRAY_COLOR );
      }
      else {
        centralLine.visible = true;
        errorBarTopNode.setFill( CurveFittingConstants.BLUE_COLOR );
        errorBarBottomNode.setFill( CurveFittingConstants.BLUE_COLOR );
      }
    } );

    // add halo to point
    var haloPointNode = new Circle( 1.75 * CurveFittingConstants.POINT_RADIUS,
      { fill: POINT_COLOR.withAlpha( HALO_ALPHA ), pickable: false, visible: false } );
    this.addChild( haloPointNode );
    circleView.addInputListener( new ButtonListener( {
      up: function() { haloPointNode.visible = false; },
      down: function() { haloPointNode.visible = true; },
      over: function() { haloPointNode.visible = true; }
    } ) );
  }

  return inherit( Node, PointNode );
} );