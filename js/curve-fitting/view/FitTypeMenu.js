// Copyright 2002-2014, University of Colorado Boulder

/**
 * Node with fit types and adjusting sliders in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var CurveType = require( 'CURVE_FITTING/curve-fitting/model/CurveType' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  var AdjustableFitString = require( 'string!CURVE_FITTING/adjustableFit' );
  var BestFitString = require( 'string!CURVE_FITTING/bestFit' );

  // constants
  var FONT = new PhetFont( 13 );
  var RADIO_BUTTON_MENU_OPTIONS = {
    spacing: 5,
    radius: 10
  };
  var SLIDER_OPTIONS = {
    trackFill: 'black',
    trackSize: new Dimension2( 140, 1 ),
    thumbSize: new Dimension2( 16, 26 )
  };
  var TICK_COLOR = 'black';
  var TICK_LENGTH = 8;
  var TICK_WIDTH = 2;

  /**
   * @param {Curve} curveModel - Model of curve
   * @param {Property} fitTypeProperty - Property to control fit type of curve
   * @param {Property} curveTypeProperty - Property to control type of curve
   * @param {Object} options for graph node
   * @constructor
   */
  function FitTypeMenu( curveModel, fitTypeProperty, curveTypeProperty, options ) {
    var content = new VBox();

    Panel.call( this, content, _.extend( {
      cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
      fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
      xMargin: CurveFittingConstants.PANEL_MARGIN,
      yMargin: CurveFittingConstants.PANEL_MARGIN
    }, options ) );

    // create radio buttons
    var fitTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { property: fitTypeProperty, node: new Text( BestFitString, { font: FONT } ), value: FitType.BEST },
      { property: fitTypeProperty, node: new Text( AdjustableFitString, { font: FONT } ), value: FitType.ADJUSTABLE }
    ], RADIO_BUTTON_MENU_OPTIONS );
    fitTypeRadioButtonGroup.localBounds = fitTypeRadioButtonGroup.localBounds.withMaxX( Math.max( fitTypeRadioButtonGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH - RADIO_BUTTON_MENU_OPTIONS.radius ) );

    // slider for parameters
    var aSlider = new HSlider( curveModel.property( 'a' ), { min: -1, max: 1 }, SLIDER_OPTIONS ),
      bSlider = new HSlider( curveModel.property( 'b' ), { min: -2, max: 2 }, SLIDER_OPTIONS ),
      cSlider = new HSlider( curveModel.property( 'c' ), { min: -10, max: 10 }, SLIDER_OPTIONS ),
      dSlider = new HSlider( curveModel.property( 'd' ), { min: -10, max: 10 }, SLIDER_OPTIONS );

    [ aSlider, bSlider, cSlider, dSlider ].forEach( function( slider ) {
      // make vertical slider
      slider.rotate( -Math.PI / 2 );

      // add central tick
      slider.addTick( 0, '', TICK_LENGTH, TICK_COLOR, TICK_WIDTH );
      slider.addTick( 0, '', -TICK_LENGTH - 2 * SLIDER_OPTIONS.trackSize.height, TICK_COLOR, TICK_WIDTH );
    } );

    // create slider box
    var slidersBox = new HBox( {
      spacing: 4,
      children: [ aSlider, bSlider, cSlider, dSlider ]
    } );

    content.addChild( fitTypeRadioButtonGroup );

    // add slider number observer
    curveTypeProperty.link( function( curveType ) {
      if ( curveType === CurveType.LINEAR ) {
        slidersBox.children = [ cSlider, dSlider ];
      }
      else if ( curveType === CurveType.QUADRATIC ) {
        slidersBox.children = [ bSlider, cSlider, dSlider ];
      }
      else if ( curveType === CurveType.CUBIC ) {
        slidersBox.children = [ aSlider, bSlider, cSlider, dSlider ];
      }
    } );

    // add slider visibility observer
    fitTypeProperty.link( function( fitType ) {
      if ( fitType === FitType.BEST && content.isChild( slidersBox ) ) {
        content.removeChild( slidersBox );
      }
      else if ( fitType === FitType.ADJUSTABLE ) {
        content.addChild( slidersBox );
      }
    } );
  }

  return inherit( Panel, FitTypeMenu );
} );