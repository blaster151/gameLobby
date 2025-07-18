class MinimalReporter {
  onRunComplete(_, results) {
    results.testResults.forEach(({ testFilePath, testResults }) => {
      testResults.forEach(({ status, fullName, failureMessages }) => {
        if (status === 'failed') {
          const firstLine = failureMessages[0]?.split('\n').slice(0, 3).join(' ') || '';
          console.log(`[FAIL] ${fullName}: ${firstLine}`);
        }
      });
    });
  }
}

module.exports = MinimalReporter;
