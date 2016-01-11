// Copyright 2015, University of Colorado Boulder

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
  var adjustableFitString = require( 'string!CURVE_FITTING/adjustableFit' );
  var bestFitString = require( 'string!CURVE_FITTING/bestFit' );

  // constants
  var FONT = new PhetFont( 12 );
  var RADIO_BUTTON_MENU_OPTIONS = {
    spacing: 5,
    radius: 8,
    touchXPadding: 5
  };

  /**
   * @param {Curve} curve model.
   * @param {Property.<string>} fitTypeProperty - Property to control fit type of curve.
   * @param {Property.<number>} orderOfFitProperty - Property to control type of curve.
   * @param {Object} [options] for graph node.
   * @constructor
   */
  function FitTypeMenu( curve, fitTypeProperty, orderOfFitProperty, options ) {
    var content = new VBox();

    // create radio buttons
    var fitTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { property: fitTypeProperty, node: new Text( bestFitString, { font: FONT } ), value: FitType.BEST },
      { property: fitTypeProperty, node: new Text( adjustableFitString, { font: FONT } ), value: FitType.ADJUSTABLE }
    ], RADIO_BUTTON_MENU_OPTIONS );
    fitTypeRadioButtonGroup.localBounds = fitTypeRadioButtonGroup.localBounds.withMaxX( Math.max( fitTypeRadioButtonGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH - RADIO_BUTTON_MENU_OPTIONS.radius ) );
    content.addChild( fitTypeRadioButtonGroup );

    // create equation node
    content.addChild( new EquationFitNode( orderOfFitProperty ) );

    // create slider for parameters
    var aSliderBox = new SliderParameterNode( curve.aProperty, { min: -1, max: 1 }, 'a' );
    var bSliderBox = new SliderParameterNode( curve.bProperty, { min: -2, max: 2 }, 'b' );
    var cSliderBox = new SliderParameterNode( curve.cProperty, { min: -10, max: 10 }, 'c' );
    var dSliderBox = new SliderParameterNode( curve.dProperty, { min: -10, max: 10 }, 'd' );

    // create slider box
    var slidersBox = new HBox( {
      spacing: 5,
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
      if ( fitType === FitType.BEST && content.hasChild( slidersBox ) ) {
        content.removeChild( slidersBox );
      }
      else if ( fitType === FitType.ADJUSTABLE ) {
        content.addChild( slidersBox );
      }
    } );

    Panel.call( this, content, _.extend( {
      cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
      fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
      xMargin: CurveFittingConstants.PANEL_MARGIN,
      yMargin: CurveFittingConstants.PANEL_MARGIN
    }, options ) );
  }

  return inherit( Panel, FitTypeMenu );
} );