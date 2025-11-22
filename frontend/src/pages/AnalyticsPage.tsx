import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Visitor Analytics
          </h1>
          <p className="text-gray-300">
            Track visitor statistics and engagement metrics for the Phobetron webapp
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </div>
  )
}

export default AnalyticsPage
