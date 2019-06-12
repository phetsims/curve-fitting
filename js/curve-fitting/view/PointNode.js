// Copyright 2015-2019, University of Colorado Boulder

/**
 * Single point node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Color = require( 'SCENERY/util/Color' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const CurveFittingQueryParameters = require( 'CURVE_FITTING/curve-fitting/CurveFittingQueryParameters' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const pattern0ValueX1ValueYString = require( 'string!CURVE_FITTING/pattern.0valueX.1valueY' );
  const patternDelta0ValueDeltaString = require( 'string!CURVE_FITTING/pattern.delta.0valueDelta' );

  // constants
  const VALUE_FONT = new PhetFont( 11 );
  const BAR_COLOR = Color.toColor( CurveFittingConstants.BLUE_COLOR );
  const CENTRAL_LINE_OPTIONS = {
    stroke: CurveFittingConstants.BLUE_COLOR,
    lineWidth: 1
  };
  const COORDINATE_BACKGROUND_RECTANGLE_OPTIONS = {
    fill: 'lightgray',
    opacity: 0.75,
    cornerRadius: 4
  };
  const DISTANCE_BETWEEN_COORDINATE_AND_DELTA = 1;
  const DILATION_SIZE = 8;
  const ERROR_BAR_BOUNDS = new Bounds2( -10, 0, 10, 2 );
  const ERROR_BAR_OPTIONS = {
    fill: CurveFittingConstants.BLUE_COLOR
  };
  const HALO_BOUNDS = new Bounds2( -12, -2, 12, 4 );
  const POINT_COLOR = Color.toColor( CurveFittingConstants.POINT_FILL );
  const HALO_BAR_OPTIONS = {
    fill: BAR_COLOR.withAlpha( 0.3 ),
    pickable: false,
    visible: false
  };
  const HALO_POINT_OPTIONS = {
    fill: POINT_COLOR.withAlpha( 0.3 ),
    pickable: false,
    visible: false
  };

  class PointNode extends Node {

    /**
     * @param {Point} point - Model for single point
     * @param {Property.<boolean>} residualsVisibleProperty
     * @param {Property.<boolean>} valuesVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options] for graph node.
     */
    constructor( point, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform, options ) {

      super( _.extend( { cursor: 'pointer' }, options ) );

      // create common drag and drop vars and functions for top and bottom error bars
      let draggingDeltaTop = false;
      let draggingDeltaBottom = false;

      // top error bar line node
      const errorBarTopNode = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
      let newDeltaValue;
      errorBarTopNode.addInputListener( new SimpleDragHandler( {
        start: () => {
          if ( !draggingDeltaBottom ) {
            draggingDeltaTop = true;
          }
        },
        translate: translationParams => {
          if ( draggingDeltaTop ) {
            newDeltaValue = point.deltaProperty.value + modelViewTransform.viewToModelDeltaY( translationParams.delta.y );

            // don't let the top error bar become the bottom error bar
            if ( newDeltaValue > 0 ) {
              point.deltaProperty.value = newDeltaValue;
            }
          }
        },
        end: () => {
          draggingDeltaTop = false;
          newDeltaValue = null;
        }
      } ) );

      // top error bar line halo node
      const haloErrorBarTopNode = new Rectangle( HALO_BOUNDS, HALO_BAR_OPTIONS );

      // top error bar
      const errorBarTop = new Node( {
        children: [ errorBarTopNode, haloErrorBarTopNode ]
      } );
      this.addChild( errorBarTop );

      // add bottom error bar line node
      const errorBarBottomNode = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
      errorBarBottomNode.addInputListener( new SimpleDragHandler( {
        start: () => {
          if ( !draggingDeltaTop ) {
            draggingDeltaBottom = true;
          }
        },
        translate: translationParams => {
          if ( draggingDeltaBottom ) {
            newDeltaValue = point.deltaProperty.value - modelViewTransform.viewToModelDeltaY( translationParams.delta.y );

            // don't let the bottom error bar become the top error bar
            if ( newDeltaValue > 0 ) {
              point.deltaProperty.value = newDeltaValue;
            }
          }
        },
        end: () => {
          draggingDeltaBottom = false;
        }
      } ) );

      // bottom error bar line halo node
      const haloTopBarBottomNode = new Rectangle( HALO_BOUNDS, HALO_BAR_OPTIONS );

      // bottom error bar
      const errorBarBottom = new Node( {
        children: [ errorBarBottomNode, haloTopBarBottomNode ]
      } );
      this.addChild( errorBarBottom );

      // add halo bar nodes handler
      const barHaloHandler = new ButtonListener( {
        up: () => {
          haloErrorBarTopNode.visible = false;
          haloTopBarBottomNode.visible = false;
        },
        down: () => {
          haloErrorBarTopNode.visible = true;
          haloTopBarBottomNode.visible = true;
        },
        over: () => {
          haloErrorBarTopNode.visible = true;
          haloTopBarBottomNode.visible = true;
        }
      } );
      errorBarBottomNode.addInputListener( barHaloHandler );
      errorBarTopNode.addInputListener( barHaloHandler );

      // add central line, of length zero initially
      const centralLine = new Line( 0, 0, 0, 0, CENTRAL_LINE_OPTIONS );
      this.addChild( centralLine );

      // add point view
      const circleView = new Circle( {
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
        start: () => {
          point.draggingProperty.set( true );
        },
        translate: ( translationParams ) => {
          if ( point.draggingProperty.value ) {
            // self.setTranslation( parentNode.globalToLocalPoint( e.pointer.point ) );
            point.positionProperty.value = point.positionProperty.value.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
          }
        },
        end: () => {
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
      const valueTextLabel = new Text( StringUtils.format( pattern0ValueX1ValueYString, Util.toFixed( point.positionProperty.value.x, 1 ), Util.toFixed( point.positionProperty.value.y, 1 ) ), {
        font: VALUE_FONT
      } );
      const valueTextBackground = new Rectangle( 0, 0, 1, 1, COORDINATE_BACKGROUND_RECTANGLE_OPTIONS );
      this.addChild( valueTextBackground );
      this.addChild( valueTextLabel );

      const deltaTextLabel = new RichText( StringUtils.format( patternDelta0ValueDeltaString, Util.toFixed( point.deltaProperty.value, 1 ) ), {
        font: VALUE_FONT
      } );
      this.addChild( deltaTextLabel );

      /**
       * Moves the deltaTextLabel if it intersects with the valueTextBackground
       */
      function removeTextIntersection() {
        if ( deltaTextLabel.bottom > valueTextBackground.top - DISTANCE_BETWEEN_COORDINATE_AND_DELTA ) {
          deltaTextLabel.bottom = valueTextBackground.top - DISTANCE_BETWEEN_COORDINATE_AND_DELTA;
        }
      }

      /**
       * updates the error bars
       *
       */
      function updateErrorBars() {
        const lineHeight = modelViewTransform.modelToViewDeltaY( point.deltaProperty.value );

        // update top error bar
        errorBarTop.setTranslation( circleView.centerX, circleView.centerY + lineHeight - ERROR_BAR_BOUNDS.height / 2 );
        errorBarTopNode.touchArea = errorBarTop.localBounds.dilated( DILATION_SIZE );
        errorBarTopNode.mouseArea = errorBarTop.localBounds.dilated( DILATION_SIZE );

        //update label
        deltaTextLabel.centerY = errorBarTop.centerY;
        removeTextIntersection();

        // update central line
        centralLine.setX1( circleView.centerX );
        centralLine.setX2( circleView.centerX );
        centralLine.setY1( circleView.centerY + lineHeight );
        centralLine.setY2( circleView.centerY - lineHeight );

        // update bottom error bar
        errorBarBottom.setTranslation( circleView.centerX, circleView.centerY - lineHeight - ERROR_BAR_BOUNDS.height / 2 );
        errorBarBottomNode.touchArea = errorBarBottom.localBounds.dilated( DILATION_SIZE );
        errorBarBottomNode.mouseArea = errorBarBottom.localBounds.dilated( DILATION_SIZE );
      }
      point.deltaProperty.link( updateErrorBars );

      /**
       * updates the value text for the points
       */
      function updateValueText() {
        if ( valueTextLabel.visible && point.isInsideGraphProperty.value ) {
          valueTextLabel.text = StringUtils.format( pattern0ValueX1ValueYString, Util.toFixed( point.positionProperty.value.x, 1 ), Util.toFixed( point.positionProperty.value.y, 1 ) );
          valueTextBackground.visible = true;
        }
        else {
          valueTextLabel.text = '';
          valueTextBackground.visible = false;
        }
        valueTextBackground.setRect( 0, 0, valueTextLabel.width + 4, valueTextLabel.height + 4 );
        valueTextLabel.center = valueTextBackground.center;
      }
      const valueTextLabelHandle = valuesVisibleProperty.linkAttribute( valueTextBackground, 'visible' );
      const valueNodeLabelHandle = valuesVisibleProperty.linkAttribute( valueTextLabel, 'visible' );
      function updateValueTextWhenVisible( valuesVisible ) {
        if ( valuesVisible ) {
          updateValueText();
        }
      }
      valuesVisibleProperty.link( updateValueTextWhenVisible );
      point.positionProperty.link( updateValueText );

      /**
       * Update the text attached to the error bar
       */
      function updateDeltaText() {
        if ( deltaTextLabel.visible ) {
          deltaTextLabel.text = StringUtils.format( patternDelta0ValueDeltaString, Util.toFixed( point.deltaProperty.value, 1 ) );
        }
      }
      function updateDeltaTextIfVisible( valuesVisible ) {
        if ( valuesVisible ) {
          updateDeltaText();
        }
      }
      valuesVisibleProperty.link( updateDeltaTextIfVisible );
      const deltaTextLabelHandle = valuesVisibleProperty.linkAttribute( deltaTextLabel, 'visible' );
      point.deltaProperty.lazyLink( updateDeltaText );

      /**
       * updates Residuals
       */
      function updateResiduals( residualsVisible ) {
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
      }
      // change appearance when residuals active
      residualsVisibleProperty.link( updateResiduals );

      // add halo to point
      const haloPointNode = new Circle( 1.75 * CurveFittingConstants.POINT_RADIUS, HALO_POINT_OPTIONS );
      this.addChild( haloPointNode );
      circleView.addInputListener( new ButtonListener( {
        up: () => { haloPointNode.visible = false; },
        down: () => { haloPointNode.visible = true; },
        over: () => { haloPointNode.visible = true; }
      } ) );

      /**
       * moves everything according to the position so that the circle view appears in where the point should
       * and everything else moves accordingly
       * @param {Vector2} position
       */
      function centerPositionListener( position ) {
        circleView.center = modelViewTransform.modelToViewPosition( position );
        haloPointNode.center = circleView.center;
        updateErrorBars();
        valueTextBackground.left = circleView.right + 2;
        valueTextBackground.centerY = circleView.centerY;
        valueTextLabel.center = valueTextBackground.center;
        deltaTextLabel.left = errorBarTop.right + 2;
        deltaTextLabel.centerY = errorBarTop.centerY;
        removeTextIntersection();
      }
      // move this node as the model moves
      point.positionProperty.link( centerPositionListener );

      this.disposePointNode = () => {
        point.deltaProperty.unlink( updateErrorBars );
        point.positionProperty.unlink( updateValueText );
        point.deltaProperty.unlink( updateDeltaText );
        point.positionProperty.unlink( centerPositionListener );
        residualsVisibleProperty.unlink( updateResiduals );
        valuesVisibleProperty.unlinkAttribute( deltaTextLabelHandle );
        valuesVisibleProperty.unlinkAttribute( valueTextLabelHandle );
        valuesVisibleProperty.unlinkAttribute( valueNodeLabelHandle );
        valuesVisibleProperty.unlink( updateValueTextWhenVisible );
        valuesVisibleProperty.unlink( updateDeltaTextIfVisible );
      };
    }

    // @public
    dispose() {
      this.disposePointNode();
      super.dispose();
    }

  }

  curveFitting.register( 'PointNode', PointNode );

  return PointNode;
} );