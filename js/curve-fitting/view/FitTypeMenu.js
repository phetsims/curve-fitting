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
  var EquationFitNode = require( 'CURVE_FITTING/curve-fitting/view/EquationFitNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SliderParameterNode = require( 'CURVE_FITTING/curve-fitting/view/SliderParameterNode' );
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

  /**
   * @param {Curve} curve model.
   * @param {Property} fitTypeProperty - Property to control fit type of curve.
   * @param {Property} orderOfFitProperty - Property to control type of curve.
   * @param {number} maxOrderOfFit - Max order of fit.
   * @param {Object} options for graph node.
   * @constructor
   */
  function FitTypeMenu( curve, fitTypeProperty, orderOfFitProperty, maxOrderOfFit, options ) {
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
    content.addChild( fitTypeRadioButtonGroup );

    // create equation node
    content.addChild( new EquationFitNode( orderOfFitProperty, maxOrderOfFit ) );

    // create slider for parameters
    var aSliderBox = new SliderParameterNode( curve.aProperty, { min: -1, max: 1 }, 'a' );
    var bSliderBox = new SliderParameterNode( curve.bProperty, { min: -2, max: 2 }, 'b' );
    var cSliderBox = new SliderParameterNode( curve.cProperty, { min: -10, max: 10 }, 'c' );
    var dSliderBox = new SliderParameterNode( curve.dProperty, { min: -10, max: 10 }, 'd' );

    // create slider box
    var slidersBox = new HBox( {
      spacing: 4,
      children: [ aSliderBox, bSliderBox, cSliderBox, dSliderBox ]
    } );

    // add slider number observer
    orderOfFitProperty.link( function( orderOfFit ) {
      if ( orderOfFit === 1 ) {
        slidersBox.children = [ cSliderBox, dSliderBox ];
      }
      else if ( orderOfFit === 2 ) {
        slidersBox.children = [ bSliderBox, cSliderBox, dSliderBox ];
      }
      else if ( orderOfFit === 3 ) {
        slidersBox.children = [ aSliderBox, bSliderBox, cSliderBox, dSliderBox ];
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