// Copyright 2016-2018, University of Colorado Boulder

/**
 * Control panel for selecting view options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Checkbox = require( 'SUN/Checkbox' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var curveString = require( 'string!CURVE_FITTING/curve' );
  var residualsString = require( 'string!CURVE_FITTING/residuals' );
  var valuesString = require( 'string!CURVE_FITTING/values' );

  /**
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function ViewOptionsPanel( curveVisibleProperty, residualsVisibleProperty, valuesVisibleProperty, options ) {

    // checkboxes
    var curveCheckbox = createCheckbox( curveVisibleProperty, curveString );
    var residualsCheckbox = createCheckbox( residualsVisibleProperty, residualsString );
    var valuesCheckbox = createCheckbox( valuesVisibleProperty, valuesString );

    // vertical layout
    var contentNode = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        curveCheckbox,
        residualsCheckbox,
        valuesCheckbox ]
    } );

    Panel.call( this, contentNode, options );

    // Saves state of residualsVisibleProperty while the residuals checkbox is disabled.
    var wereResidualsVisible = residualsVisibleProperty.get();

    // Visibility of the curve affects other controls.
    curveVisibleProperty.link( function( isCurveVisible ) {

      // Enable residuals checkbox when curve is checked.
      residualsCheckbox.enabled = isCurveVisible;

      if ( isCurveVisible ) {

        // When curve is checked, restore the state of residuals.
        residualsVisibleProperty.set( wereResidualsVisible );
      }
      else {

        // When the curve is unchecked, save state and turn off residuals.
        wereResidualsVisible = residualsVisibleProperty.get();
        residualsVisibleProperty.set( false );
      }
    } );
  }

  curveFitting.register( 'ViewOptionsPanel', ViewOptionsPanel );

  /**
   * Creates a checkbox for this panel.
   *
   * @param {Property} property
   * @param {string} label
   * @returns {Checkbox}
   */
  var createCheckbox = function( property, label ) {
    return new Checkbox( new Text( label, CurveFittingConstants.CONTROL_TEXT_OPTIONS ), property,
      CurveFittingConstants.CHECK_BOX_OPTIONS );
  };

  return inherit( Panel, ViewOptionsPanel );
} );
