// Copyright 2015-2019, University of Colorado Boulder

/**
 * Single point node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
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
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const pointCoordinatesPatternString = require( 'string!CURVE_FITTING/pointCoordinatesPattern' );
  const deltaEqualsPatternString = require( 'string!CURVE_FITTING/deltaEqualsPattern' );

  // constants
  const MIN_DELTA = 1E-3; // arbitrarily small non-zero number for minimum delta: 0 causes divide by 0 errors
  const MAX_DELTA = 10;
  const VALUE_TEXT_OPTIONS = { font: new PhetFont( 11 ), maxWidth: 100 };
  const BAR_COLOR = Color.toColor( CurveFittingConstants.BLUE_COLOR );
  const CENTRAL_LINE_OPTIONS = {
    stroke: CurveFittingConstants.BLUE_COLOR,
    lineWidth: 1
  };
  const COORDINATE_BACKGROUND_RECTANGLE_OPTIONS = {
    fill: CurveFittingConstants.POINT_FILL,
    opacity: 0.75,
    cornerRadius: 4
  };
  const DELTA_BACKGROUND_RECTANGLE_OPTIONS = {
    fill: 'white',
    opacity: 0.75,
    cornerRadius: 4
  };
  const VALUE_BACKGROUND_PADDING = 2;
  const DISTANCE_BETWEEN_COORDINATE_AND_DELTA = 1;
  const ERROR_BAR_DILATION_X = 14;
  const ERROR_BAR_DILATION_Y = 2;
  const ERROR_BAR_BOUNDS = new Bounds2( -10, 0, 10, 2 );
  const ERROR_BAR_OPTIONS = {
    fill: CurveFittingConstants.BLUE_COLOR
  };
  const HALO_BOUNDS = new Bounds2( -12, -2, 12, 4 );
  const POINT_COLOR = Color.toColor( CurveFittingConstants.POINT_FILL );
  const CIRCLE_VIEW_OPTIONS = {
    fill: POINT_COLOR,
    radius: CurveFittingConstants.POINT_RADIUS,
    stroke: CurveFittingConstants.POINT_STROKE,
    lineWidth: CurveFittingConstants.POINT_LINE_WIDTH
  };
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
     * @param {function} bumpOutFunction - a function that bumps this point out of invalid locations (see #131)
     * @param {Point[]} currentlyInteractingPoints - an array of points that are being interacted with currently
     *  is used to determine when points should be displaying their halos (see #133)
     * @param {Property.<boolean>} residualsVisibleProperty
     * @param {Property.<boolean>} valuesVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options] for graph node.
     */
    constructor( point, bumpOutFunction, currentlyInteractingPoints, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform, options ) {

      super( _.extend( { cursor: 'pointer' }, options ) );

      // bottom error bar
      const errorBarBottomRectangle = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
      const errorBarBottomHaloRectangle = new Rectangle( HALO_BOUNDS, HALO_BAR_OPTIONS );
      const errorBarBottomNode = new Node( { children: [ errorBarBottomRectangle, errorBarBottomHaloRectangle ] } );
      this.addChild( errorBarBottomNode );

      // top error bar
      const errorBarTopRectangle = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
      const errorBarTopHaloRectangle = new Rectangle( HALO_BOUNDS, HALO_BAR_OPTIONS );
      const errorBarTopNode = new Node( { children: [ errorBarTopRectangle, errorBarTopHaloRectangle ] } );
      this.addChild( errorBarTopNode );

      // central line, of length zero initially
      const centralLine = new Line( 0, 0, 0, 0, CENTRAL_LINE_OPTIONS );
      this.addChild( centralLine );

      // delta text label
      const deltaTextLabel = new RichText(
        StringUtils.fillIn( deltaEqualsPatternString, { deltaValue: Util.toFixed( point.deltaProperty.value, 1 ) } ),
        VALUE_TEXT_OPTIONS
      );
      const deltaTextBackground = new Rectangle( 0, 0, 1, 1, DELTA_BACKGROUND_RECTANGLE_OPTIONS );
      this.addChild( deltaTextBackground);
      this.addChild( deltaTextLabel );

      // handler for delta halos
      const barHaloHandler = new ButtonListener( {
        up: () => {
          errorBarTopHaloRectangle.visible = false;
          errorBarBottomHaloRectangle.visible = false;
        },
        down: () => {
          errorBarTopHaloRectangle.visible = true;
          errorBarBottomHaloRectangle.visible = true;
        },
        over: () => {
          errorBarTopHaloRectangle.visible = currentlyInteractingPoints.length === 0;
          errorBarBottomHaloRectangle.visible = currentlyInteractingPoints.length === 0;
        }
      } );
      errorBarBottomRectangle.addInputListener( barHaloHandler );
      errorBarTopRectangle.addInputListener( barHaloHandler );

      // point view
      const circleView = new Circle( CIRCLE_VIEW_OPTIONS );
      circleView.touchArea = circleView.bounds.dilated( 5 );
      circleView.mouseArea = circleView.bounds.dilated( 5 );
      this.addChild( circleView );

      // utility functions that record this point in the currentlyInteractingPoints array as being interacted with or not
      const addPointAsCurrentlyInteracting = () => {
        if ( !_.includes( currentlyInteractingPoints, point ) ) {
          currentlyInteractingPoints.push( point );
        }
      };
      const removePointFromCurrentlyInteracting = () => {
        if ( _.includes( currentlyInteractingPoints, point ) ) {
          currentlyInteractingPoints.splice( currentlyInteractingPoints.indexOf( point ), 1 );
        }
      };

      // variables that allow for the top bar to be dragged in either direction when it covers the bottom bar; see #127
      // initialTopBarDragLocation is null unless it is relevant for choosing a dragging direction
      let shouldTopBarActLikeBottomBar = false;
      let initialTopBarDragLocation = null;

      // handling for error bar dragging
      let isDraggingDeltaTop = false;
      let isDraggingDeltaBottom = false;
      errorBarTopRectangle.addInputListener( new DragListener( {
        start: event => {
          isDraggingDeltaTop = !isDraggingDeltaBottom;

          // the top bar is currently covering the bottom bar so initialTopBarDragLocation is set to be non-null
          // initialTopBarDragLocation is now set to the current mouse location because it is now relevant
          //  for choosing a drag direction
          if ( point.deltaProperty.value === MIN_DELTA ) {
            initialTopBarDragLocation = event.pointer.point;
          }

          addPointAsCurrentlyInteracting();
        },
        drag: event => {
          if ( !isDraggingDeltaTop ) {
            return;
          }

          // necessary because button listener doesn't activate for touch snag
          errorBarTopHaloRectangle.visible = true;
          errorBarBottomHaloRectangle.visible = true;

          let newUnclampedDelta = modelViewTransform.viewToModelDeltaY( this.globalToLocalPoint( event.pointer.point ).y - circleView.centerY );

          // if initialTopBarDragLocation has a value, that means that it is intentionally so because the user can choose a drag direction
          // the allowed direction of the top bar drag is now set by whether the user dragged up or down
          // if the user dragged down, the top bar acts like the bottom bar because that is how the user interacted with it
          // for this case, the user couldn't have interacted with the actual bottom bar because it was covered by this top one
          if ( initialTopBarDragLocation !== null ) {
            shouldTopBarActLikeBottomBar = event.pointer.point.y > initialTopBarDragLocation.y;
            initialTopBarDragLocation = null;
          }

          if ( shouldTopBarActLikeBottomBar ) {
            newUnclampedDelta = modelViewTransform.viewToModelDeltaY( circleView.centerY - this.globalToLocalPoint( event.pointer.point ).y );
          }
          point.deltaProperty.value = Util.clamp(
            newUnclampedDelta,
            MIN_DELTA,
            MAX_DELTA
          );
        },
        end: () => {
          isDraggingDeltaTop = false;
          shouldTopBarActLikeBottomBar = false;
          initialTopBarDragLocation = null;
          removePointFromCurrentlyInteracting();

          // necessary because button listener doesn't activate for touch snag
          errorBarTopHaloRectangle.visible = false;
          errorBarBottomHaloRectangle.visible = false;
        }
      } ) );
      errorBarBottomRectangle.addInputListener( new DragListener( {
        start: () => {
          isDraggingDeltaBottom = !isDraggingDeltaTop;
          addPointAsCurrentlyInteracting();
        },
        drag: event => {
          if ( !isDraggingDeltaBottom ) {
            return;
          }

          // necessary because button listener doesn't activate for touch snag
          errorBarTopHaloRectangle.visible = true;
          errorBarBottomHaloRectangle.visible = true;

          point.deltaProperty.value = Util.clamp(
            modelViewTransform.viewToModelDeltaY( circleView.centerY - this.globalToLocalPoint( event.pointer.point ).y ),
            MIN_DELTA,
            MAX_DELTA
          );
        },
        end: () => {
          isDraggingDeltaBottom = false;
          removePointFromCurrentlyInteracting();

          // necessary because button listener doesn't activate for touch snag
          errorBarTopHaloRectangle.visible = false;
          errorBarBottomHaloRectangle.visible = false;
        }
      } ) );

      // value text label
      const valueTextLabel = new Text(
        StringUtils.fillIn(
          pointCoordinatesPatternString,
          {
            xCoordinate: Util.toFixed( point.positionProperty.value.x, 1 ),
            yCoordinate: Util.toFixed( point.positionProperty.value.y, 1 )
          }
        ),
        VALUE_TEXT_OPTIONS
      );
      const valueTextBackground = new Rectangle( 0, 0, 1, 1, COORDINATE_BACKGROUND_RECTANGLE_OPTIONS );
      this.addChild( valueTextBackground );
      this.addChild( valueTextLabel );

      // add drag handler for point
      circleView.addInputListener( new DragListener( {
        allowTouchSnag: true,
        start: () => {
          point.draggingProperty.value = true;
          this.moveToFront();
          addPointAsCurrentlyInteracting();
        },
        drag: event => {
          if ( !point.draggingProperty.value ) {
            return;
          }
          point.positionProperty.value = modelViewTransform.viewToModelPosition( this.globalToLocalPoint( event.pointer.point ) );
        },
        end: () => {
          point.draggingProperty.value = false;
          bumpOutFunction();
          if ( CurveFittingQueryParameters.snapToGrid ) {
            point.positionProperty.value = new Vector2(
              Util.toFixedNumber( point.positionProperty.value.x, 0 ),
              Util.toFixedNumber( point.positionProperty.value.y, 0 )
            );
          }
          removePointFromCurrentlyInteracting();
        }
      } ) );

      /**
       * updates the error bars and corresponding text
       */
      function updateDelta() {

        // update text
        deltaTextLabel.text = StringUtils.fillIn(
          deltaEqualsPatternString,
          { deltaValue: Util.toFixed( point.deltaProperty.value, 1 ) }
        );

        const lineHeight = modelViewTransform.modelToViewDeltaY( point.deltaProperty.value );

        // update top error bar
        errorBarTopNode.setTranslation( circleView.centerX, circleView.centerY + lineHeight - ERROR_BAR_BOUNDS.height / 2 );
        errorBarTopRectangle.touchArea = errorBarTopNode.localBounds.dilatedXY( ERROR_BAR_DILATION_X, ERROR_BAR_DILATION_Y );
        errorBarTopRectangle.mouseArea = errorBarTopNode.localBounds.dilatedXY( ERROR_BAR_DILATION_X, ERROR_BAR_DILATION_Y );

        // update central line
        centralLine.setX1( circleView.centerX );
        centralLine.setX2( circleView.centerX );
        centralLine.setY1( circleView.centerY + lineHeight );
        centralLine.setY2( circleView.centerY - lineHeight );

        // update bottom error bar
        errorBarBottomNode.setTranslation( circleView.centerX, circleView.centerY - lineHeight - ERROR_BAR_BOUNDS.height / 2 );
        errorBarBottomRectangle.touchArea = errorBarBottomNode.localBounds.dilatedXY( ERROR_BAR_DILATION_X, ERROR_BAR_DILATION_Y );
        errorBarBottomRectangle.mouseArea = errorBarBottomNode.localBounds.dilatedXY( ERROR_BAR_DILATION_X, ERROR_BAR_DILATION_Y );

        // update text background positioning
        deltaTextBackground.centerY = errorBarTopNode.centerY;
        deltaTextBackground.left = errorBarTopNode.right + 2;
        deltaTextBackground.setRect(
          0,
          0,
          deltaTextLabel.width + 2 * VALUE_BACKGROUND_PADDING,
          deltaTextLabel.height + 2 * VALUE_BACKGROUND_PADDING
        );

        // update label and background and ensure that coordinate and delta backgrounds do not intersect
        if ( deltaTextBackground.bottom > valueTextBackground.top - DISTANCE_BETWEEN_COORDINATE_AND_DELTA ) {
          deltaTextBackground.bottom = valueTextBackground.top - DISTANCE_BETWEEN_COORDINATE_AND_DELTA;
        }

        // set text position to final background position
        deltaTextLabel.center = deltaTextBackground.center;
      }
      point.deltaProperty.link( updateDelta );

      /**
       * updates the value text for the coordinates and the position of the labels
       */
      function updateValue() {

        // update text
        valueTextLabel.text = StringUtils.fillIn(
          pointCoordinatesPatternString,
          {
            xCoordinate: Util.toFixed( point.positionProperty.value.x, 1 ),
            yCoordinate: Util.toFixed( point.positionProperty.value.y, 1 )
          }
        );

        // update visibility
        valueTextLabel.visible = valuesVisibleProperty.value && point.isInsideGraphProperty.value;
        valueTextBackground.visible = valueTextLabel.visible;

        // update positionings
        valueTextBackground.left = circleView.right + 2;
        valueTextBackground.centerY = circleView.centerY;
        valueTextBackground.setRect(
          0,
          0,
          valueTextLabel.width + 2 * VALUE_BACKGROUND_PADDING,
          valueTextLabel.height + 2 * VALUE_BACKGROUND_PADDING
        );
        valueTextLabel.center = valueTextBackground.center;
      }

      const valueBackgroundHandle = valuesVisibleProperty.linkAttribute( valueTextBackground, 'visible' );
      const valueTextHandle = valuesVisibleProperty.linkAttribute( valueTextLabel, 'visible' );
      const deltaBackgroundHandle = valuesVisibleProperty.linkAttribute( deltaTextBackground, 'visible' );
      const deltaTextHandle = valuesVisibleProperty.linkAttribute( deltaTextLabel, 'visible' );

      /**
       * updates how the error bars look based on whether the residuals are visible or not
       * @param {boolean} residualsVisible
       */
      function updateErrorBarsBasedOnResidualsVisibility( residualsVisible ) {
        if ( residualsVisible ) {
          centralLine.visible = false;
          errorBarTopRectangle.setFill( CurveFittingConstants.LIGHT_GRAY_COLOR );
          errorBarBottomRectangle.setFill( CurveFittingConstants.LIGHT_GRAY_COLOR );
        }
        else {
          centralLine.visible = true;
          errorBarTopRectangle.setFill( CurveFittingConstants.BLUE_COLOR );
          errorBarBottomRectangle.setFill( CurveFittingConstants.BLUE_COLOR );
        }
      }
      residualsVisibleProperty.link( updateErrorBarsBasedOnResidualsVisibility );

      // point halo
      const haloPointNode = new Circle( 1.75 * CurveFittingConstants.POINT_RADIUS, HALO_POINT_OPTIONS );
      this.addChild( haloPointNode );
      circleView.addInputListener( new ButtonListener( {
        up: () => { haloPointNode.visible = false; },
        down: () => { haloPointNode.visible = true; },
        over: () => { haloPointNode.visible = currentlyInteractingPoints.length === 0 || _.includes( currentlyInteractingPoints, point ); }
      } ) );

      /**
       * updates all the view positions and texts whenever the point model's position changes
       * @param {Vector2} position
       */
      function centerPositionListener( position ) {
        circleView.center = modelViewTransform.modelToViewPosition( position );
        haloPointNode.center = circleView.center;
        updateValue();
        updateDelta();
      }
      point.positionProperty.link( centerPositionListener );

      this.disposePointNode = () => {
        point.deltaProperty.unlink( updateDelta );
        point.positionProperty.unlink( centerPositionListener );
        residualsVisibleProperty.unlink( updateErrorBarsBasedOnResidualsVisibility );
        valuesVisibleProperty.unlinkAttribute( deltaTextHandle );
        valuesVisibleProperty.unlinkAttribute( valueTextHandle );
        valuesVisibleProperty.unlinkAttribute( deltaBackgroundHandle );
        valuesVisibleProperty.unlinkAttribute( valueBackgroundHandle );
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
