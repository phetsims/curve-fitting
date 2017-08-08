// Copyright 2015-2016, University of Colorado Boulder

/**
 * Single point node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var CurveFittingQueryParameters = require( 'CURVE_FITTING/curve-fitting/CurveFittingQueryParameters' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var pattern0ValueX1ValueYString = require( 'string!CURVE_FITTING/pattern.0valueX.1valueY' );
  var patternDelta0ValueDeltaString = require( 'string!CURVE_FITTING/pattern.delta.0valueDelta' );

  // constants
  var VALUE_FONT = new PhetFont( 11 );
  var BAR_COLOR = Color.toColor( CurveFittingConstants.BLUE_COLOR );
  var CENTRAL_LINE_OPTIONS = {
    stroke: CurveFittingConstants.BLUE_COLOR,
    lineWidth: 1
  };
  var DILATION_SIZE = 8;
  var ERROR_BAR_BOUNDS = new Bounds2( -10, 0, 10, 2 );
  var ERROR_BAR_OPTIONS = {
    fill: CurveFittingConstants.BLUE_COLOR
  };
  var HALO_BOUNDS = new Bounds2( -12, -2, 12, 4 );
  var POINT_COLOR = Color.toColor( CurveFittingConstants.POINT_FILL );
  var HALO_BAR_OPTIONS = {
    fill: BAR_COLOR.withAlpha( 0.3 ),
    pickable: false,
    visible: false
  };
  var HALO_POINT_OPTIONS = {
    fill: POINT_COLOR.withAlpha( 0.3 ),
    pickable: false,
    visible: false
  };

  /**
   * @param {Point} point - Model for single point
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function PointNode( point, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform, options ) {

    Node.call( this, _.extend( { cursor: 'pointer' }, options ) );

    // create common drag and drop vars and functions for top and bottom error bars
    var draggingDeltaTop = false;
    var draggingDeltaBottom = false;

    // top error bar line node
    var errorBarTopNode = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
    var newDeltaValue;
    errorBarTopNode.addInputListener( new SimpleDragHandler( {
      start: function() {
        if ( !draggingDeltaBottom ) {
          draggingDeltaTop = true;
        }
      },
      translate: function( translationParams ) {
        if ( draggingDeltaTop ) {
          newDeltaValue = point.deltaProperty.value + modelViewTransform.viewToModelDeltaY( translationParams.delta.y );

          // don't let the top error bar become the bottom error bar
          if ( newDeltaValue > 0 ) {
            point.deltaProperty.value = newDeltaValue;
          }
        }
      },
      end: function() {
        draggingDeltaTop = false;
        newDeltaValue = null;
      }
    } ) );

    // top error bar line halo node
    var haloErrorBarTopNode = new Rectangle( HALO_BOUNDS, HALO_BAR_OPTIONS );

    // top error bar
    var errorBarTop = new Node( {
      children: [ errorBarTopNode, haloErrorBarTopNode ]
    } );
    this.addChild( errorBarTop );

    // add bottom error bar line node
    var errorBarBottomNode = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
    errorBarBottomNode.addInputListener( new SimpleDragHandler( {
      start: function() {
        if ( !draggingDeltaTop ) {
          draggingDeltaBottom = true;
        }
      },
      translate: function( translationParams ) {
        if ( draggingDeltaBottom ) {
          newDeltaValue = point.deltaProperty.value - modelViewTransform.viewToModelDeltaY( translationParams.delta.y );

          // don't let the bottom error bar become the top error bar
          if ( newDeltaValue > 0 ) {
            point.deltaProperty.value = newDeltaValue;
          }
        }
      },
      end: function() {
        draggingDeltaBottom = false;
      }
    } ) );

    // bottom error bar line halo node
    var haloTopBarBottomNode = new Rectangle( HALO_BOUNDS, HALO_BAR_OPTIONS );

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

    // add central line, of length zero initially
    var centralLine = new Line( 0, 0, 0, 0, CENTRAL_LINE_OPTIONS );
    this.addChild( centralLine );

    // add point view
    var circleView = new Circle( {
      fill: POINT_COLOR,
      radius: CurveFittingConstants.POINT_RADIUS,
      stroke: CurveFittingConstants.POINT_STROKE,
      lineWidth: CurveFittingConstants.POINT_LINE_WIDTH
    } );
    circleView.touchArea = circleView.bounds.dilated( 3 );
    circleView.mouseArea = circleView.bounds.dilated( 1 );
    this.addChild( circleView );

    // add drag handler for point
    circleView.addInputListener( new SimpleDragHandler( {
      allowTouchSnag: true,
      start: function() {
        point.draggingProperty.set( true );
      },
      translate: function( translationParams ) {
        if ( point.draggingProperty.value ) {
          // self.setTranslation( parentNode.globalToLocalPoint( e.pointer.point ) );
          point.positionProperty.value = point.positionProperty.value.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
        }
      },
      end: function() {
        point.draggingProperty.set( false );
        if ( CurveFittingQueryParameters.snapToGrid ) {
          point.positionProperty.set( new Vector2(
            Util.toFixedNumber( point.positionProperty.value.x, 0 ),
            Util.toFixedNumber( point.positionProperty.value.y, 0 )
          ) );
        }
      }
    } ) );

    // add value text label
    var valueTextLabel = new Text( StringUtils.format( pattern0ValueX1ValueYString, Util.toFixed( point.positionProperty.value.x, 1 ), Util.toFixed( point.positionProperty.value.y, 1 ) ), {
      font: VALUE_FONT
    } );
    this.addChild( valueTextLabel );

    var deltaTextLabel = new RichText( StringUtils.format( patternDelta0ValueDeltaString, Util.toFixed( point.deltaProperty.value, 1 ) ), {
      font: VALUE_FONT
    } );
    this.addChild( deltaTextLabel );

    /**
     * updates the error bars
     *
     */
    var updateErrorBars = function() {
      var lineHeight = modelViewTransform.modelToViewDeltaY( point.deltaProperty.value );

      // update top error bar
      errorBarTop.setTranslation( circleView.centerX, circleView.centerY + lineHeight - ERROR_BAR_BOUNDS.height / 2 );
      errorBarTopNode.touchArea = errorBarTop.localBounds.dilated( DILATION_SIZE );
      errorBarTopNode.mouseArea = errorBarTop.localBounds.dilated( DILATION_SIZE );

      //update label
      deltaTextLabel.centerY = errorBarTop.centerY;

      // update central line
      centralLine.setX1( circleView.centerX );
      centralLine.setX2( circleView.centerX );
      centralLine.setY1( circleView.centerY + lineHeight );
      centralLine.setY2( circleView.centerY - lineHeight );

      // update bottom error bar
      errorBarBottom.setTranslation( circleView.centerX, circleView.centerY - lineHeight - ERROR_BAR_BOUNDS.height / 2 );
      errorBarBottomNode.touchArea = errorBarBottom.localBounds.dilated( DILATION_SIZE );
      errorBarBottomNode.mouseArea = errorBarBottom.localBounds.dilated( DILATION_SIZE );
    };
    point.deltaProperty.link( updateErrorBars );

    /**
     * updates the value text for the points
     */
    var updateValueText = function() {
      if ( valueTextLabel.visible && point.isInsideGraphProperty.value ) {
        valueTextLabel.setText( StringUtils.format( pattern0ValueX1ValueYString, Util.toFixed( point.positionProperty.value.x, 1 ), Util.toFixed( point.positionProperty.value.y, 1 ) ) );
      }
      else {
        valueTextLabel.setText( '' );
      }
    };
    var valueTextLabelHandle = valuesVisibleProperty.linkAttribute( valueTextLabel, 'visible' );
    var updateValueTextHandle = valuesVisibleProperty.onValue( true, updateValueText );
    point.positionProperty.link( updateValueText );

    /**
     * Update the text attached to the error bar
     */
    var updateDeltaText = function() {
      if ( deltaTextLabel.visible ) {
        deltaTextLabel.setText( StringUtils.format( patternDelta0ValueDeltaString, Util.toFixed( point.deltaProperty.value, 1 ) ) );
      }
    };
    var updateDeltaTextHandle = valuesVisibleProperty.onValue( true, updateDeltaText );
    var deltaTextLabelHandle = valuesVisibleProperty.linkAttribute( deltaTextLabel, 'visible' );
    point.deltaProperty.lazyLink( updateDeltaText );

    /**
     * updates Residuals
     */
    var updateResiduals = function( residualsVisible ) {
      if ( residualsVisible ) {
        centralLine.visible = false;
        errorBarTopNode.setFill( CurveFittingConstants.LIGHT_GRAY_COLOR );
        errorBarBottomNode.setFill( CurveFittingConstants.LIGHT_GRAY_COLOR );
      }
      else {
        centralLine.visible = true;
        errorBarTopNode.setFill( CurveFittingConstants.BLUE_COLOR );
        errorBarBottomNode.setFill( CurveFittingConstants.BLUE_COLOR );
      }
    };
    // change appearance when residuals active
    residualsVisibleProperty.link( updateResiduals );

    // add halo to point
    var haloPointNode = new Circle( 1.75 * CurveFittingConstants.POINT_RADIUS, HALO_POINT_OPTIONS );
    this.addChild( haloPointNode );
    circleView.addInputListener( new ButtonListener( {
      up: function() { haloPointNode.visible = false; },
      down: function() { haloPointNode.visible = true; },
      over: function() { haloPointNode.visible = true; }
    } ) );

    /**
     * moves everything according to the position so that the circle view appears in where the point should
     * and everything else moves accordingly
     * @param {Vector2} position
     */
    var centerPositionListener = function( position ) {
      circleView.center = modelViewTransform.modelToViewPosition( position );
      haloPointNode.center = circleView.center;
      updateErrorBars();
      valueTextLabel.setTranslation( circleView.centerX + circleView.localBounds.maxX + 2, circleView.centerY );
      deltaTextLabel.setTranslation( errorBarTop.centerX + errorBarTop.localBounds.maxX + 2, errorBarTop.centerY );
    };
    // move this node as the model moves
    point.positionProperty.link( centerPositionListener );

    //TODO verify that this is complete and correct
    this.disposePointNode = function() {
      point.deltaProperty.unlink( updateErrorBars );
      point.positionProperty.unlink( updateValueText );
      point.deltaProperty.unlink( updateDeltaText );
      point.positionProperty.unlink( centerPositionListener );
      residualsVisibleProperty.unlink( updateResiduals );
      valuesVisibleProperty.unlinkAttribute( deltaTextLabelHandle );
      valuesVisibleProperty.unlinkAttribute( valueTextLabelHandle );
      valuesVisibleProperty.unlink( updateValueTextHandle );
      valuesVisibleProperty.unlink( updateDeltaTextHandle );
    };
  }

  curveFitting.register( 'PointNode', PointNode );

  return inherit( Node, PointNode, {

    // @public
    dispose: function() {
      this.disposePointNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );