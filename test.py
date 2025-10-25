from memryx import NeuralCompiler

# Initialize the Neural Compiler with the model path and output filename
nc = NeuralCompiler(models="fire_HOPE.onnx", dfp_fname="fire_HOPE.dfp", autocrop=True)

# Compile the model
dfp = nc.run()