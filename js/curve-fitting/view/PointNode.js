// Copyright 2015-2023, University of Colorado Boulder

/**
 * Single point node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { ButtonListener, Circle, Color, DragListener, Line, Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingStrings from '../../CurveFittingStrings.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import CurveFittingQueryParameters from '../CurveFittingQueryParameters.js';

const deltaEqualsPatternString = CurveFittingStrings.deltaEqualsPattern;
const pointCoordinatesPatternString = CurveFittingStrings.pointCoordinatesPattern;
const ySymbolString = CurveFittingStrings.ySymbol;

// constants
const Y_PATTERN = `<i style='font-family:${CurveFittingConstants.EQUATION_SYMBOL_FONT.family}'>{{y}}</i>`;

// range for delta
const MIN_DELTA = 1E-3; // arbitrarily small non-zero number for minimum delta, 0 causes divide-by-0 errors
const MAX_DELTA = 10;

// point (circle)
const POINT_COLOR = Color.toColor( CurveFittingConstants.POINT_FILL );
const POINT_OPTIONS = {
  fill: POINT_COLOR,
  stroke: CurveFittingConstants.POINT_STROKE,
  lineWidth: CurveFittingConstants.POINT_LINE_WIDTH
};
const POINT_HALO_OPTIONS = {
  fill: POINT_COLOR.withAlpha( 0.3 ),
  pickable: false,
  visible: false
};

// displayed values (delta, coordinates)
const VALUE_TEXT_OPTIONS = {
  font: CurveFittingConstants.POINT_VALUE_FONT,
  maxWidth: 100 // determined empirically
};
const VALUE_MARGIN = 2;
const VALUE_BACKGROUND_CORNER_RADIUS = 4;

// error bars
const ERROR_BAR_COLOR = Color.toColor( CurveFittingConstants.BLUE_COLOR );
const ERROR_BAR_DILATION_X = 14;
const ERROR_BAR_DILATION_Y = 2;
const ERROR_BAR_BOUNDS = new Bounds2( -10, 0, 10, 2 );
const ERROR_BAR_OPTIONS = {
  fill: ERROR_BAR_COLOR
};
const ERROR_BAR_HALO_BOUNDS = new Bounds2( -12, -2, 12, 4 );
const ERROR_BAR_HALO_OPTIONS = {
  fill: ERROR_BAR_COLOR.withAlpha( 0.3 ),
  pickable: false,
  visible: false
};

// Vertical line that connects the error bars
const CENTRAL_LINE_OPTIONS = {
  stroke: ERROR_BAR_COLOR,
  lineWidth: 1
};

// spacing
const DELTA_COORDINATES_Y_SPACING = 1; // vertical spacing between delta and coordinates
const POINT_COORDINATES_X_SPACING = 5; // horizontal space between point and coordinates
const ERROR_BAR_DELTA_X_SPACING = 2; // horizontal space between error bar and delta display

class PointNode extends Node {

  /**
   * @param {Point} point - Model for single point
   * @param {function} bumpOutFunction - a function that bumps this point out of invalid positions (see #131)
   * @param {Point[]} currentlyInteractingPoints - an array of points that are being interacted with currently
   *  is used to determine when points should be displaying their halos (see #133)
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node.
   */
  constructor( point, bumpOutFunction, currentlyInteractingPoints, residualsVisibleProperty, valuesVisibleProperty,
               modelViewTransform, options ) {

    super( merge( { cursor: 'pointer' }, options ) );

    // bottom error bar
    const errorBarBottomRectangle = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
    const errorBarBottomHaloRectangle = new Rectangle( ERROR_BAR_HALO_BOUNDS, ERROR_BAR_HALO_OPTIONS );
    const errorBarBottomNode = new Node( { children: [ errorBarBottomRectangle, errorBarBottomHaloRectangle ] } );
    this.addChild( errorBarBottomNode );

    // top error bar
    const errorBarTopRectangle = new Rectangle( ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS );
    const errorBarTopHaloRectangle = new Rectangle( ERROR_BAR_HALO_BOUNDS, ERROR_BAR_HALO_OPTIONS );
    const errorBarTopNode = new Node( { children: [ errorBarTopRectangle, errorBarTopHaloRectangle ] } );
    this.addChild( errorBarTopNode );

    // central line, of length zero initially
    const centralLine = new Line( 0, 0, 0, 0, CENTRAL_LINE_OPTIONS );
    this.addChild( centralLine );

    // delta text label
    const deltaTextLabel = new RichText( '', VALUE_TEXT_OPTIONS ); // text to be set by updateDelta
    const deltaTextBackground = new Rectangle( 0, 0, 1, 1, {
      fill: 'white',
      opacity: 0.75,
      cornerRadius: VALUE_BACKGROUND_CORNER_RADIUS
    } );
    this.addChild( deltaTextBackground );
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
    const circleView = new Circle( CurveFittingConstants.POINT_RADIUS, POINT_OPTIONS );
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
    // initialTopBarDragPosition is null unless it is relevant for choosing a dragging direction
    let shouldTopBarActLikeBottomBar = false;
    let initialTopBarDragPosition = null;

    // handling for error bar dragging
    let isDraggingDeltaTop = false;
    let isDraggingDeltaBottom = false;
    errorBarTopRectangle.addInputListener( new DragListener( {
      start: event => {
        isDraggingDeltaTop = !isDraggingDeltaBottom;

        // the top bar is currently covering the bottom bar so initialTopBarDragPosition is set to be non-null
        // initialTopBarDragPosition is now set to the current mouse position because it is now relevant
        //  for choosing a drag direction
        if ( point.deltaProperty.value === MIN_DELTA ) {
          initialTopBarDragPosition = event.pointer.point;
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

        let newUnclampedDelta = modelViewTransform.viewToModelDeltaY(
          this.globalToLocalPoint( event.pointer.point ).y - circleView.centerY
        );

        // If initialTopBarDragPosition has a value, that means that it is intentionally so because the user can
        // choose a drag direction the allowed direction of the top bar drag is now set by whether the user dragged
        // up or down. If the user dragged down, the top bar acts like the bottom bar because that is how the user
        // interacted with it for this case, the user couldn't have interacted with the actual bottom bar because
        // it was covered by this top one.
        if ( initialTopBarDragPosition !== null ) {
          shouldTopBarActLikeBottomBar = event.pointer.point.y > initialTopBarDragPosition.y;
          initialTopBarDragPosition = null;
        }

        if ( shouldTopBarActLikeBottomBar ) {
          newUnclampedDelta = modelViewTransform.viewToModelDeltaY(
            circleView.centerY - this.globalToLocalPoint( event.pointer.point ).y
          );
        }
        point.deltaProperty.value = Utils.clamp(
          newUnclampedDelta,
          MIN_DELTA,
          MAX_DELTA
        );
      },
      end: () => {
        isDraggingDeltaTop = false;
        shouldTopBarActLikeBottomBar = false;
        initialTopBarDragPosition = null;
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

        point.deltaProperty.value = Utils.clamp(
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
      StringUtils.fillIn( pointCoordinatesPatternString, {
        xCoordinate: Utils.toFixed( point.positionProperty.value.x, 1 ),
        yCoordinate: Utils.toFixed( point.positionProperty.value.y, 1 )
      } ),
      VALUE_TEXT_OPTIONS
    );
    const valueTextBackground = new Rectangle( 0, 0, 1, 1, {
      fill: CurveFittingConstants.POINT_FILL,
      opacity: 0.75,
      cornerRadius: VALUE_BACKGROUND_CORNER_RADIUS
    } );
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
            Utils.toFixedNumber( point.positionProperty.value.x, 0 ),
            Utils.toFixedNumber( point.positionProperty.value.y, 0 )
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
      deltaTextLabel.string = StringUtils.fillIn( deltaEqualsPatternString, {
        y: StringUtils.fillIn( Y_PATTERN, {
          y: ySymbolString
        } ),
        deltaValue: Utils.toFixed( point.deltaProperty.value, 1 )
      } );

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
      deltaTextBackground.left = errorBarTopNode.right + ERROR_BAR_DELTA_X_SPACING;
      deltaTextBackground.setRect(
        0,
        0,
        deltaTextLabel.width + 2 * VALUE_MARGIN,
        deltaTextLabel.height + 2 * VALUE_MARGIN
      );

      // update label and background and ensure that coordinate and delta backgrounds do not intersect
      if ( deltaTextBackground.bottom > valueTextBackground.top - DELTA_COORDINATES_Y_SPACING ) {
        deltaTextBackground.bottom = valueTextBackground.top - DELTA_COORDINATES_Y_SPACING;
      }

      // set text position to final background position
      deltaTextLabel.center = deltaTextBackground.center;
    }

    // must be unlinked in dispose
    point.deltaProperty.link( updateDelta );

    /**
     * updates the value text for the coordinates and the position of the labels
     */
    function updateValue() {

      // update text
      valueTextLabel.string = StringUtils.fillIn(
        pointCoordinatesPatternString,
        {
          xCoordinate: Utils.toFixed( point.positionProperty.value.x, 1 ),
          yCoordinate: Utils.toFixed( point.positionProperty.value.y, 1 )
        }
      );

      // update visibility
      valueTextLabel.visible = valuesVisibleProperty.value && point.isInsideGraphProperty.value;
      valueTextBackground.visible = valueTextLabel.visible;

      // update positionings
      valueTextBackground.left = circleView.right + POINT_COORDINATES_X_SPACING;
      valueTextBackground.centerY = circleView.centerY;
      valueTextBackground.setRect(
        0,
        0,
        valueTextLabel.width + 2 * VALUE_MARGIN,
        valueTextLabel.height + 2 * VALUE_MARGIN
      );
      valueTextLabel.center = valueTextBackground.center;
    }

    // these require unlink in dispose
    const valueBackgroundHandle = visible => {valueTextBackground.visible = visible;};
    const valueTextHandle = visible => {valueTextLabel.visible = visible;};
    const deltaBackgroundHandle = visible => {deltaTextBackground.visible = visible;};
    const deltaTextHandle = visible => {deltaTextLabel.visible = visible;};

    valuesVisibleProperty.link( valueBackgroundHandle );
    valuesVisibleProperty.link( valueTextHandle );
    valuesVisibleProperty.link( deltaBackgroundHandle );
    valuesVisibleProperty.link( deltaTextHandle );

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

    // must be unlinked in dispose
    residualsVisibleProperty.link( updateErrorBarsBasedOnResidualsVisibility );

    // point halo
    const haloPointNode = new Circle( 1.75 * CurveFittingConstants.POINT_RADIUS, POINT_HALO_OPTIONS );
    this.addChild( haloPointNode );
    circleView.addInputListener( new ButtonListener( {
      up: () => { haloPointNode.visible = false; },
      down: () => { haloPointNode.visible = true; },
      over: () => {
        haloPointNode.visible = currentlyInteractingPoints.length === 0 || _.includes( currentlyInteractingPoints, point );
      }
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

    // must be unlinked in dispose
    point.positionProperty.link( centerPositionListener );

    // @private
    this.disposePointNode = () => {
      point.deltaProperty.unlink( updateDelta );
      point.positionProperty.unlink( centerPositionListener );
      residualsVisibleProperty.unlink( updateErrorBarsBasedOnResidualsVisibility );
      valuesVisibleProperty.unlink( deltaTextHandle );
      valuesVisibleProperty.unlink( valueTextHandle );
      valuesVisibleProperty.unlink( deltaBackgroundHandle );
      valuesVisibleProperty.unlink( valueBackgroundHandle );
    };
  }

  // @public
  dispose() {
    this.disposePointNode();
    super.dispose();
  }

}

curveFitting.register( 'PointNode', PointNode );
export default PointNode;
