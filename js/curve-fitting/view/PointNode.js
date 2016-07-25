// Copyright 2015, University of Colorado Boulder

/**
 * Single point node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Bounds2 = require( 'DOT/Bounds2' );
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
  var pattern0ValueX1ValueYString = require( 'string!CURVE_FITTING/pattern.0valueX.1valueY' );
  var patternDelta0ValueDeltaString = require( 'string!CURVE_FITTING/pattern.delta.0valueDelta' );

  // constants
  var FONT = new PhetFont( 11 );
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
   * @param {Point} point - Model for single point.
   * @param {Property.<boolean>} areValuesVisibleProperty - Property to control visibility of values.
   * @param {Property.<boolean>} areResidualsVisibleProperty - Property to track residuals visibility.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function PointNode( point, areValuesVisibleProperty, areResidualsVisibleProperty, modelViewTransform, options ) {
    Node.call( this, _.extend( { cursor: 'pointer' }, options ) );

    // create common drag and drop vars and functions for top and bottom error bars
    var isUserControlledDeltaTop = false;
    var isUserControlledDeltaBottom = false;

    // top error bar line node
    var errorBarTopNode = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
    var newDeltaValue;
    errorBarTopNode.addInputListener( new SimpleDragHandler( {
      start: function() {
        if ( !isUserControlledDeltaBottom ) {
          isUserControlledDeltaTop = true;
        }
      },
      translate: function( translationParams ) {
        if ( isUserControlledDeltaTop ) {
          newDeltaValue = point.delta + modelViewTransform.viewToModelDeltaY( translationParams.delta.y );

          // don't let the top error bar become the bottom error bar
          if ( newDeltaValue > 0 ) {
            point.delta = newDeltaValue;
          }
        }
      },
      end: function() {
        isUserControlledDeltaTop = false;
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
        if ( !isUserControlledDeltaTop ) {
          isUserControlledDeltaBottom = true;
        }
      },
      translate: function( translationParams ) {
        if ( isUserControlledDeltaBottom ) {
          newDeltaValue = point.delta - modelViewTransform.viewToModelDeltaY( translationParams.delta.y );

          // don't let the bottom error bar become the top error bar
          if ( newDeltaValue > 0 ) {
            point.delta = newDeltaValue;
          }
        }
      },
      end: function() {
        isUserControlledDeltaBottom = false;
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
      start: function() {
        point.isUserControlled = true;
      },
      translate: function( translationParams ) {
        if ( point.isUserControlled ) {
          // self.setTranslation( parentNode.globalToLocalPoint( e.pointer.point ) );
          point.position = point.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
        }
      },
      end: function() {
        point.isUserControlled = false;
      }
    } ) );

    // add value text label
    var valueTextLabel = new Text( StringUtils.format( pattern0ValueX1ValueYString, Util.toFixed( point.position.x, 1 ), Util.toFixed( point.position.y, 1 ) ), {
      font: FONT
    } );
    this.addChild( valueTextLabel );

    var deltaTextLabel = new SubSupText( StringUtils.format( patternDelta0ValueDeltaString, Util.toFixed( point.delta, 1 ) ), {
      font: FONT
    } );
    this.addChild( deltaTextLabel );

    /**
     * updates the error bars
     *
     */
    var updateErrorBars = function() {
      var lineHeight = modelViewTransform.modelToViewDeltaY( point.delta );

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
      if ( valueTextLabel.visible && point.isInsideGraph ) {
        valueTextLabel.setText( StringUtils.format( pattern0ValueX1ValueYString, Util.toFixed( point.position.x, 1 ), Util.toFixed( point.position.y, 1 ) ) );
      }
      else {
        valueTextLabel.setText( '' );
      }
    };
    var valueTextLabelHandle = areValuesVisibleProperty.linkAttribute( valueTextLabel, 'visible' );
    var updateValueTextHandle = areValuesVisibleProperty.onValue( true, updateValueText );
    point.positionProperty.link( updateValueText );

    /**
     * Update the text attached tp the error bar
     */
    var updateDeltaText = function() {
      if ( deltaTextLabel.visible ) {
        deltaTextLabel.setText( StringUtils.format( patternDelta0ValueDeltaString, Util.toFixed( point.delta, 1 ) ) );
      }
    };
    var updateDeltaTextHandle = areValuesVisibleProperty.onValue( true, updateDeltaText );
    var deltaTextLabelHandle = areValuesVisibleProperty.linkAttribute( deltaTextLabel, 'visible' );
    point.deltaProperty.lazyLink( updateDeltaText );


    /**
     * updates Residuals
     */
    var updateResiduals = function( areResidualsVisible ) {
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
    };
    // change appearance when residuals active
    areResidualsVisibleProperty.link( updateResiduals );

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

    this.disposePointNode = function() {
      point.deltaProperty.unlink( updateErrorBars );
      point.positionProperty.unlink( updateValueText );
      point.deltaProperty.unlink( updateDeltaText );
      point.positionProperty.unlink( centerPositionListener );
      areResidualsVisibleProperty.unlink( updateResiduals );
      areValuesVisibleProperty.unlinkAttribute( deltaTextLabelHandle );
      areValuesVisibleProperty.unlinkAttribute( valueTextLabelHandle );
      areValuesVisibleProperty.unlink( updateValueTextHandle );
      areValuesVisibleProperty.unlink( updateDeltaTextHandle );
    };

  }

  curveFitting.register( 'PointNode', PointNode );

  return inherit( Node, PointNode, {
    /**
     * @public
     */
    dispose: function() {
      this.disposePointNode();
    }
  } );
} );