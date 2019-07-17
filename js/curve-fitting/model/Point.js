// Copyright 2015-2019, University of Colorado Boulder

/**
 * Point model in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const Animation = require( 'TWIXT/Animation' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Easing = require( 'TWIXT/Easing' );
  const Emitter = require( 'AXON/Emitter' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class Point {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {

      options = _.extend( {
        position: new Vector2( 0, 0 ), // {Vector2} initial position
        dragging: false // {boolean} is the user dragging the point?
      }, options );

      // @public {Property.<Vector2>} position of point
      this.positionProperty = new Vector2Property( options.position );

      // @public {Property.<boolean>} property that reflects whether the user is dragging the point
      this.draggingProperty = new BooleanProperty( options.dragging );

      // @public {Property.<number>} vertical uncertainty of the point.
      this.deltaProperty = new NumberProperty( 0.8 );

      // @private {Animation|null} the animation of this point; is null if there is no animation
      this.animation = null;

      // @public {Property.<boolean>} a property that reflects whether the point is in the graph
      this.isInsideGraphProperty = new DerivedProperty(
        [ this.positionProperty ],
        position => CurveFittingConstants.GRAPH_BACKGROUND_MODEL_BOUNDS.containsPoint( position )
      );

      // if the user dropped the point outside of the graph send it back to the bucket
      this.draggingProperty.link( dragging => {
        if ( !dragging && !this.isInsideGraphProperty.value && this.animation === null ) {
          this.animate();
        }
        if ( dragging && this.animation !== null ) {
          this.animation.stop();
        }
      } );

      // create emitter that will signal that the point has returned to the bucket
      this.returnToOriginEmitter = new Emitter();
    }

    /**
     * Animates the point back to its original position (inside the bucket).
     *
     * @public
     */
    animate() {

      // distance to the origin
      const getDistanceToOrigin = () => this.positionProperty.initialValue.distance( this.positionProperty.value );
      const distance = getDistanceToOrigin();

      if ( distance > 0 ) {

        // sets up the animation
        this.animation = new Animation( {
          property: this.positionProperty,
          to: this.positionProperty.initialValue,
          duration: distance / CurveFittingConstants.ANIMATION_SPEED,
          easing: Easing.LINEAR
        } );

        // once the animation is done, set the animation field to null
        // if the final destination was reached, emit the returnToOriginEmitter
        this.animation.endedEmitter.addListener( () => {
          if ( getDistanceToOrigin() === 0 ) {
            this.returnToOriginEmitter.emit();
          }
          this.animation = null;
        } );

        this.animation.start();
      }
      else {

        // if the point is already at where it belongs, just emit and forgo the animation
        this.returnToOriginEmitter.emit();
      }
    }

  }

  curveFitting.register( 'Point', Point );

  return Point;
} );