export default function errorHandler(error, req, res, next) {
    console.error(error.stack);
    res.status(500).json({ message: 'Something went wrong!', error: error.message });
  }