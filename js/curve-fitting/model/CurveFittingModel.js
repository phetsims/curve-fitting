// Copyright 2015, University of Colorado Boulder

/**
 * Main model constructor for 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Bucket = require( 'PHETCOMMON/model/Bucket' );
  var Curve = require( 'CURVE_FITTING/curve-fitting/model/Curve' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var GRAPH_MODEL_BOUNDS = CurveFittingConstants.GRAPH_MODEL_BOUNDS;
  var BUCKET_WIDTH = 5; // in model coordinates
  var BUCKET_HEIGHT = BUCKET_WIDTH * 0.50;
  var BUCKET_POSITION = new Vector2( GRAPH_MODEL_BOUNDS.minX - 3, GRAPH_MODEL_BOUNDS.minY + 1 ); // bucket is to the left and up from the bottom left corner of graph, in model coordinates

  /**
   * Main constructor for CurveFittingModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function CurveFittingModel() {
    PropertySet.call( this, {
      areResidualsVisible: false, // residuals visibility flag
      areValuesVisible: false, // values visibility flag
      orderOfFit: 1, // property to control curve type
      fitType: FitType.BEST, // property to control fit type
      isDeviationPanelExpanded: true, // property to control deviation panel expansion
      isEquationPanelExpanded: true // property to control equation panel expansion
    } );

    // @public (read-only) model bounds for the graph
    this.graphModelBounds = GRAPH_MODEL_BOUNDS;

    // @public (read-only) bucket model
    this.bucket = new Bucket( {
      position: BUCKET_POSITION,
      size: new Dimension2( BUCKET_WIDTH, BUCKET_HEIGHT ),
      baseColor: 'rgb( 65, 63, 117 )'
    } );

    // @public curve model
    this.curve = new Curve( this.orderOfFitProperty, this.fitTypeProperty );
  }

  curveFitting.register( 'CurveFittingModel', CurveFittingModel );

  return inherit( PropertySet, CurveFittingModel, {
    /**
     *  Resets this model properties and the curve
     */
    reset: function() {
      PropertySet.prototype.reset.call( this );

      // reset curve model
      this.curve.reset();
    }
  } );
} );